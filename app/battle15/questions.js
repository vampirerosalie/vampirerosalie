import bank from './bank.json' with { type: 'json' };
import illustrations from './art.json' with { type: 'json' };

// Authoring order and the marking key only exist inside the Worker.
const image = filename => '/battle15/art/' + filename;
export const QUESTIONS = bank.map(question => {
  const artwork = illustrations[question.id];
  return {
    ...question,
    scene: image(artwork.scene),
    options: question.options.map((option, index) => ({
      ...option,
      art: image(artwork.options[index]),
    })),
  };
});
