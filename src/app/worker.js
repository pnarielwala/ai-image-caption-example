import { pipeline, env } from '@xenova/transformers';

// Skip local model check
env.allowLocalModels = false;

// Use the Singleton pattern to enable lazy construction of the pipeline.
class PipelineSingleton {
  static task = 'image-to-text';
  static model = 'Xenova/vit-gpt2-image-captioning';
  static instance = null;

  static async getInstance(progress_callback = null) {
    if (this.instance === null) {
      this.instance = pipeline(this.task, this.model, {
        progress_callback,
      });
    }
    return this.instance;
  }
}

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
  const timeStart = performance.now();
  // Retrieve the classification pipeline. When called for the first time,
  // this will load the pipeline and save it for future use.
  const classifier = await PipelineSingleton.getInstance((x) => {
    // We also add a progress callback to the pipeline so that we can
    // track model loading.
    console.log('Progress:', x);
    self.postMessage('progress');
  }).catch((e) => {
    console.log('Error in worker', e);
  });

  // Actually perform the classification
  const output = await classifier(event.data).catch(() => {
    console.log('Error in classifier', e);
  });

  const timeEnd = performance.now();
  // Send the output back to the main thread
  self.postMessage({
    output: output?.[0]?.generated_text ?? 'No output',
    timeSpent: (timeEnd - timeStart).toFixed(2),
  });
});
