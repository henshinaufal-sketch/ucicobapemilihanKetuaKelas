import ResultsBoard from "./ResultsBoard";

export default function Home() {
  return (
    <>
      <h1>Hasil Sementara</h1>
      <p className="muted">Siapa yang akan jadi ketua kelas? Hasil di bawah ini diperbarui secara langsung.</p>
      <ResultsBoard />
    </>
  );
}
