use tracing_subscriber::prelude::*;
use tracing_subscriber::filter::LevelFilter;

pub fn init_tracing() {
    let level_filter = std::env::var("RUST_LOG")
        .unwrap_or_else(|_| "info".to_string())
        .parse::<LevelFilter>()
        .unwrap_or(LevelFilter::INFO);

    let subscriber = tracing_subscriber::registry()
        .with(
            tracing_subscriber::fmt::layer()
                .json()
                .with_line_number(true)
                .with_file(true)
                .with_current_span(true)
                .with_target(true)
                .with_thread_ids(true)
                .with_filter(level_filter),
        );

    tracing::subscriber::set_global_default(subscriber)
        .expect("Failed to set subscriber");
}