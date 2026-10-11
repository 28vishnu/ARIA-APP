class ScreenService {
  private stream: MediaStream | null = null;

  async start(video: HTMLVideoElement) {
    this.stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: false,
    });

    video.srcObject = this.stream;

    await video.play();
  }

  stop() {
    this.stream?.getTracks().forEach(track => track.stop());
    this.stream = null;
  }

  capture(video: HTMLVideoElement) {
    const canvas = document.createElement("canvas");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");

    if (!ctx) return "";

    ctx.drawImage(video, 0, 0);

    return canvas.toDataURL("image/png");
  }
}

export default new ScreenService();
