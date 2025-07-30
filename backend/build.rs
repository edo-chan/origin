use std::process::Command;
use std::{env, fs, path::PathBuf};

fn compile_proto(
    proto: Vec<PathBuf>,
    proto_dir: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    // Ensure proto/rust/gen directory exists
    let rust_out_dir = PathBuf::from("../proto/rust/gen");
    fs::create_dir_all(&rust_out_dir)?;
    
    tonic_build::configure()
        .compile_well_known_types(true)
        .build_server(true)
        .build_client(true)
        .out_dir("../proto/rust/gen")
        .type_attribute(".", "#[derive(serde::Serialize, serde::Deserialize)]")
        .compile(
            &proto.iter().map(|p| p.as_path()).collect::<Vec<_>>(), 
            &[proto_dir, "../googleapis"]
        )?;
    Ok(())
}

fn compile_envoy_descriptor_set(
    all_proto_definitions: Vec<PathBuf>,
    manifest_dir: PathBuf,
    proto_dir: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    // envoy descriptor
    let static_out = manifest_dir.join("envoy/proto.pb");
    fs::create_dir_all(static_out.parent().unwrap())?;
    tonic_build::configure()
        .build_server(false)
        .build_client(false)
        .file_descriptor_set_path(&static_out)
        .compile(
            &all_proto_definitions.iter().map(|p| p.as_path()).collect::<Vec<_>>(), 
            &[proto_dir, "../googleapis"]
        )?;
    Ok(())
}

fn compile_web(
    all_proto_definitions: Vec<PathBuf>,
    manifest_dir: PathBuf,
    proto_dir: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    // Ensure proto/gen/web directory exists
    let web_out_dir = PathBuf::from("../proto/gen/web");
    fs::create_dir_all(&web_out_dir)?;

    let frontend_dir = manifest_dir.join("../frontend");
    if !frontend_dir.join("node_modules").exists() {
        println!("cargo:warning=frontend node_modules does not exist. Skipping web compilation");
        return Ok(());
    }
    
    // running ts protoc
    let mut ts_args = vec![
        format!(
            "--plugin={}/node_modules/.bin/protoc-gen-ts_proto",
            frontend_dir.display()
        ),
        format!("--ts_proto_out={}", web_out_dir.display()),
        "--ts_proto_opt=env=browser,outputServices=generic,forceLong=bigint,snakeToCamel=true"
            .to_string(),
    ];
    let import_path = format!("-I={proto_dir}");
    ts_args.push(import_path);
    ts_args.push("-I=../googleapis".to_string());
    for proto in all_proto_definitions.iter() {
        ts_args.push(format!("{}", proto.display()));
    }
    ts_args.push("--experimental_allow_proto3_optional".to_string());
    let output = Command::new("protoc").args(ts_args).output()?;
    if !output.status.success() {
        println!("cargo:warning=ts-protoc error: {}", output.status);
    }

    Ok(())
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("cargo:rerun-if-changed=../proto/*");
    let manifest_dir = PathBuf::from(env::var("CARGO_MANIFEST_DIR")?);
    let proto_dir = manifest_dir.join("../proto");

    // Current proto definitions - simplified for this template
    let proto_definitions = vec![
        vec![proto_dir.join("greeter.proto")],
    ];

    let mut all_proto_definitions = Vec::new();
    for proto in proto_definitions.clone() {
        all_proto_definitions.extend(proto);
    }

    // compile rust proto generator
    for proto in proto_definitions {
        compile_proto(
            proto,
            proto_dir.to_str().unwrap(),
        )?;
    }

    // compile envoy descriptor set
    compile_envoy_descriptor_set(
        all_proto_definitions.clone(),
        manifest_dir.clone(),
        proto_dir.to_str().unwrap(),
    )?;

    // compile web
    compile_web(
        all_proto_definitions.clone(),
        manifest_dir.clone(),
        proto_dir.to_str().unwrap(),
    )?;

    Ok(())
}
