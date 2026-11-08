import { Suspense } from "react";
import VoteForm from "./VoteForm";

export default function VotePage() {
  return (
    <Suspense fallback={<p className="muted">Memuat…</p>}>
      <VoteForm />
    </Suspense>
  );
}
