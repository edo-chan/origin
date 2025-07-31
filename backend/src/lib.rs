// Library modules
pub mod gen {
    include!(concat!(env!("CARGO_MANIFEST_DIR"), "/../proto/rust/gen/service.rs"));
}
pub mod adapter;
pub mod handler;
pub mod model;
pub mod logging;