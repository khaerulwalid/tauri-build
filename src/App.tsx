import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

interface Barang {
  id: number;
  nama: string;
  stok: number;
}

function App() {
  const [nama, setNama] = useState("");
  const [stok, setStok] = useState(0);
  const [data, setData] = useState<Barang[]>([]);
  const [error, setError] = useState("");

  const load = () => {
    invoke<Barang[]>("list_barang").then(setData);
  };

  const tambah = async () => {
    if (!nama.trim()) {
      setError("Nama Barang wajib diisi");
      return;
    }
    setError("");
    await invoke("create_barang", { nama, stok });
    setNama("");
    setStok(0);
    load();
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>CRUD Barang POS</h2>

      <input
        placeholder="Nama Barang"
        value={nama}
        onChange={(e) => setNama(e.target.value)}
      />
      {error && <div style={{ color: "red", marginTop: 4 }}>{error}</div>}
      <input
        type="number"
        placeholder="Stok"
        value={stok}
        onChange={(e) => setStok(Number(e.target.value))}
      />
      <button onClick={tambah}>Tambah</button>

      <table border={1} cellPadding="4" style={{ marginTop: 20 }}>
        <thead>
          <tr><th>ID</th><th>Nama</th><th>Stok</th></tr>
        </thead>
        <tbody>
          {data.map((b) => (
            <tr key={b.id}>
              <td>{b.id}</td>
              <td>{b.nama}</td>
              <td>{b.stok}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
