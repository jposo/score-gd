class ToastManager {
  queue: { id: string; message: string; type: "info" | "error" | "success" }[] =
    $state([]);

  add(
    message: string,
    type: "info" | "error" | "success",
    duration: number = 3000,
  ) {
    const id = crypto.randomUUID();
    const newToast = { id, message, type };

    this.queue.push(newToast);

    setTimeout(() => {
      this.remove(id);
    }, duration);
  }

  remove(id: string) {
    this.queue = this.queue.filter((t) => t.id !== id);
  }
}

export const toastManager = new ToastManager();
