use std::process::Command;
use std::path::Path;
use std::fs;

// Define all proto files in a single location
const PROTO_FILES: &[&str] = &["proto/greeter.proto"];

// Define the path for the Envoy descriptor output
const ENVOY_DESCRIPTOR_OUT: &str = "proto.pb";

fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Generate Rust code from proto files using tonic-build
    tonic_build::configure()
        .compile(PROTO_FILES, &["proto"])?;

    // Create frontend proto/gen directory if it doesn't exist
    let frontend_gen_dir = Path::new("../frontend/proto/gen");
    if !frontend_gen_dir.exists() {
        fs::create_dir_all(frontend_gen_dir)?;
    }

    // Generate TypeScript types directly in the frontend directory
    // For each proto file, we need to run the protoc command
    // Make TypeScript generation optional - log errors but don't fail the build
    for proto_file in PROTO_FILES {
        match Command::new("npx")
            .args([
                "protoc",
                "--plugin=protoc-gen-ts_proto=./node_modules/.bin/protoc-gen-ts_proto",
                "--ts_proto_out=../frontend/proto/gen",
                "--ts_proto_opt=esModuleInterop=true,outputServices=false,outputJsonMethods=false,outputClientImpl=false,fileSuffix=",
                "-I=proto",
                proto_file
            ])
            .status() {
                Ok(status) => {
                    if !status.success() {
                        eprintln!("Warning: Failed to generate TypeScript types for {}", proto_file);
                    } else {
                        println!("Successfully generated TypeScript types for frontend from {}", proto_file);
                    }
                },
                Err(e) => {
                    eprintln!("Warning: Failed to execute TypeScript generation command: {}", e);
                }
            }
    }

    // Generate Envoy descriptor file
    println!("Generating Envoy descriptor file...");
    match Command::new("protoc")
        .args([
            "-Iproto",
            "--include_imports",
            "--include_source_info",
            &format!("--descriptor_set_out={}", ENVOY_DESCRIPTOR_OUT),
            "proto/greeter.proto"
        ])
        .status() {
            Ok(status) => {
                if !status.success() {
                    eprintln!("Warning: Failed to generate Envoy descriptor file");
                } else {
                    println!("Successfully generated Envoy descriptor file at {}", ENVOY_DESCRIPTOR_OUT);
                }
            },
            Err(e) => {
                eprintln!("Warning: Failed to execute Envoy descriptor generation command: {}", e);
            }
        }

    // Set up cargo to recompile if any proto file changes
    for proto_file in PROTO_FILES {
        println!("cargo:rerun-if-changed={}", proto_file);
    }

    Ok(())
}
