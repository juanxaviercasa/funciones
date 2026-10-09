import { Player } from "@remotion/player";
import { FunctionMachine, TransformationMotion } from "../remotion";
import { usePreferences } from "../preferences";
export default function MicroLesson({
  transformation = false,
}: {
  transformation?: boolean;
}) {
  const { motion, captions } = usePreferences();
  return (
    <section aria-label="Microlección animada">
      <h2>Observa el proceso</h2>
      {transformation ? (
        <Player
          component={TransformationMotion}
          inputProps={{ motionEnabled: motion, showCaption: captions }}
          durationInFrames={150}
          fps={30}
          compositionWidth={800}
          compositionHeight={450}
          controls
          autoPlay={false}
          style={{ width: "100%" }}
        />
      ) : (
        <Player
          component={FunctionMachine}
          inputProps={{ motionEnabled: motion, showCaption: captions }}
          durationInFrames={120}
          fps={30}
          compositionWidth={800}
          compositionHeight={450}
          controls
          autoPlay={false}
          style={{ width: "100%" }}
        />
      )}
      <p>
        {transformation
          ? "La gráfica base se desplaza 1,5 unidades a la derecha y 1 hacia arriba."
          : "La entrada 3 se multiplica por 2 y se suma 1: la salida es 7."}{" "}
        Sin audio; el texto describe toda la animación.
      </p>
    </section>
  );
}
