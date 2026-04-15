import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex bg-background h-screen flex-col items-center justify-center text-center px-4">
      <h1 className="text-8xl font-bold text-primary/30 mb-4">404</h1>
      <h2 className="text-2xl font-bold mb-2">Sahifa topilmadi</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        Marshrut noto&apos;g&apos;ri yoki sahifa o&apos;chirilgan.
      </p>
      <Button render={<Link href="/" />}>Dashboardga qaytish</Button>
    </div>
  );
}
