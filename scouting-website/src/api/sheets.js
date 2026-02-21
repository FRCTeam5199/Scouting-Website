const scriptURL = import.meta.env.VITE_SCRIPT_URL;

export async function sendData(form) {
  const formData = new FormData(form);

  try {
    const response = await fetch(scriptURL, {
      method: "POST",
      body: formData,
    });

    return await response.json();
  } catch (e) {
    console.error(e);
  }
}
