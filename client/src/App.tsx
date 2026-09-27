import "./App.css";

import { useState } from "react";

//ui
import { MainButton } from "./ui/ButtonUi";
import Items from "./components/items";

function App() {
  return (
    <section className="p-4 md:p-8">
      <p className="text-4xl text-white">VaultMM</p>
      <MainButton size="md">
        <p>Click me</p>
      </MainButton>
      <Items />
    </section>
  );
}

export default App;
