export async function loadBrowserCredentials() {
  if (!window.PasswordCredential || !navigator.credentials?.get) return null;
  try {
    const credential = await navigator.credentials.get({
      password: true,
      mediation: "optional",
    });
    if (!credential?.id || !credential?.password) return null;
    return { email: credential.id, password: credential.password };
  } catch {
    return null;
  }
}

export async function storeBrowserCredentials({ email, password, name }) {
  if (!window.PasswordCredential || !navigator.credentials?.store) return false;
  try {
    const credential = new window.PasswordCredential({
      id: email,
      password,
      name: name || email,
    });
    await navigator.credentials.store(credential);
    return true;
  } catch {
    return false;
  }
}
