// Library modules
pub use prost_types::Timestamp;

pub mod gen {
    pub mod auth {
        include!(concat!(env!("CARGO_MANIFEST_DIR"), "/../proto/rust/gen/auth.rs"));
    }

    pub mod greeter {
        include!(concat!(env!("CARGO_MANIFEST_DIR"), "/../proto/rust/gen/greeter.rs"));
    }
}
pub mod adapter;
pub mod handler;
pub mod model;
pub mod logging;