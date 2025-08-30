// Library modules
pub use prost_types::Timestamp;

pub mod gen {
    pub mod auth {
        tonic::include_proto!("auth");
    }

    pub mod accounts {
        tonic::include_proto!("accounts");
    }
}
pub mod adapter;
pub mod handler;
pub mod model;
pub mod logging;