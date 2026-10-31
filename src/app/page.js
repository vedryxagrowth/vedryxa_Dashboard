
"use client"
import Image from "next/image";
import { redirect } from 'next/navigation';
export default function page() {
  redirect("/Dashboard");
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
      <h1 style={{ color: "red" }}>
        Welcome to vedryxa .
      </h1>
    </div>
  );
}
