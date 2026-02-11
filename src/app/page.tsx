import { cva } from "class-variance-authority";
import BackgroundRemoverApp from "../components/BackgroundRemoverApp";

const mainStyles = cva([
  "max-w-150 mr-auto sm:mx-auto p-6 pr-12 sm:pr-6 relative page-edge-fade",
]);
const headingStyles = cva(["text-center mb-4 text-[1.3rem]"]);

export default async function Home() {
  return (
    <main className={mainStyles()}>
      <h1 className={headingStyles()}>Background Remover</h1>
      <BackgroundRemoverApp />
    </main>
  );
}
