class CameraService {
  private stream: MediaStream | null = null;

  async start(video: HTMLVideoElement): Promise<void> {
    if (this.stream) {
      if (video.srcObject !== this.stream) {
        video.srcObject = this.stream;
      }

      if (video.paused) {
        await video.play();
      }

      return;
    }

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      throw new Error(
        "Camera access is not supported by this browser."
      );
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: {
          ideal: "environment",
        },
        width: {
          ideal: 1280,
        },
        height: {
          ideal: 720,
        },
      },
      audio: false,
    });

    this.stream = stream;

    video.srcObject = stream;

    await video.play();
  }

  stop(): void {
    if (this.stream) {
      this.stream
        .getTracks()
        .forEach((track) => track.stop());
    }

    this.stream = null;
  }

  isActive(): boolean {
    return this.stream !== null;
  }

  capture(video: HTMLVideoElement): string {
    if (
      !video.videoWidth ||
      !video.videoHeight
    ) {
      return "";
    }

    const canvas = document.createElement("canvas");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return "";
    }

    ctx.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return canvas.toDataURL(
      "image/jpeg",
      0.85
    );
  }

  async switchCamera(
    video: HTMLVideoElement
  ): Promise<void> {
    this.stop();

    await this.start(video);
  }
}

export default new CameraService();