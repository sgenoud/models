export default function Model({
  origin,
  model,
}: {
  origin: string;
  model: string;
}) {
  const modelUrl =
    "https://studio.replicad.xyz/share/" +
    encodeURIComponent(`${origin}/models/${model}.js`) +
    "?ortho-camera=true";

  return (
    <iframe src={modelUrl} width="100%" height="600px" allowFullScreen></iframe>
  );
}
