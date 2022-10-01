<script lang="ts">
  let username: string;
  let password: string;
  let confirmPassword: string;
  
  let error: string;

  async function formSubmit() {
    if (!passValid() || !usernameValid()) return;

    const res = await fetch('http://localhost:3000/auth/signup', {
      credentials: "include",
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username,
        password: password
      }),
    });

    const text = await res.text();
    error = text;
  }

  const passValid = () => {
    if (password.length <= 8) {
      error = 'Password must be more than 7 characters';
      return false;
    } else if (password !== confirmPassword) {
      error = 'Passwords do not match';
      return false;
    } else {
      error = '';
      return true;
    }
  }
  const usernameValid = () => {
    const isValid = username.length >= 4;
    error = isValid ? '' : 'Username must be more than 7 characters';

    return isValid;
  }
</script>

<form on:submit|preventDefault={formSubmit}>
  <input type="text" name="username" id="username" bind:value={username} on:input={usernameValid}>

  <input type="password" name="password" id="password" bind:value={password} on:input={passValid}>
  <input type="password" name="confirm-password" id="confirm-password" bind:value={confirmPassword} on:input={passValid}>

  
  <input type="submit" value="Sign Up">
</form>

{#if error}
  <p>{ error }</p>
{/if}