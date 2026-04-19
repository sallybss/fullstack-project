const requiredMajor = Number(process.argv[2] || 22);
const currentMajor = Number(process.versions.node.split(".")[0]);

if (currentMajor !== requiredMajor) {
  console.error(
    [
      `Unsupported Node.js version: ${process.versions.node}`,
      `Use Node ${requiredMajor}.x for this project.`,
      "Example: `nvm use` from the repo root after installing that version.",
    ].join("\n"),
  );
  process.exit(1);
}
