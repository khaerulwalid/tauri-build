#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tokio_postgres::NoTls;
use serde::Serialize;
use tauri::command;

#[derive(Serialize)]
struct Barang {
    id: i32,
    nama: String,
    stok: i32,
}

async fn get_db() -> tokio_postgres::Client {
    let conn_str = "host=localhost user=qpay dbname=posdb";
    let (client, connection) = tokio_postgres::connect(conn_str, NoTls)
        .await
        .expect("Gagal connect ke PostgreSQL");

    tauri::async_runtime::spawn(async move {
        if let Err(e) = connection.await {
            eprintln!("DB error: {}", e);
        }
    });

    client
}

#[command]
async fn list_barang() -> Vec<Barang> {
    let client = get_db().await;

    let result = client
        .query("SELECT id, nama, stok FROM barang ORDER BY id DESC", &[])
        .await;

    match result {
        Ok(rows) => rows.into_iter()
            .map(|r| Barang {
                id: r.get(0),
                nama: r.get(1),
                stok: r.get(2),
            })
            .collect(),
        Err(_) => vec![],
    }
}

#[command]
async fn create_barang(nama: String, stok: i32) {
    let client = get_db().await;

    client
        .execute(
            "INSERT INTO barang (nama, stok) VALUES ($1, $2)",
            &[&nama, &stok],
        )
        .await
        .unwrap();
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![list_barang, create_barang])
        .run(tauri::generate_context!())
        .expect("Error running Tauri app");
}
