<script lang="ts">
  let username: string;
  let password: string;

  let error: string;

  async function formSubmit() {
    const res = await fetch('http://localhost:3000/auth/signin', {
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
</script>

<form on:submit|preventDefault={formSubmit}>
  <input type="text" name="username" id="username" bind:value={username}>
  <input type="password" name="password" id="password" bind:value={password}>
  
  <input type="submit" value="Sign In">
</form>

{#if error}
  <p>{ error }</p>
{/if}