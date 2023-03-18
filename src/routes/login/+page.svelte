<script>
	import supabase from '../../supabase.js';

	let email = '';
	let password = '';
	let usermail = '';

	async function login() {
		const { data, error } = await supabase.auth.signInWithPassword({
			email: email,
			password: password
		});

		if (error) {
			console.error('Login error:', error.message);
		} else {
			console.log('Logged in:', data);
		}

		email = '';
		password = '';
		// @ts-ignore
		usermail = data.user?.email;
	}
</script>

<form on:submit|preventDefault={login}>
	{#if usermail}
		<p>Logged in as {usermail}</p>
	{:else}
		<p>Not logged in</p>
	{/if}
	<input type="email" bind:value={email} placeholder="Email" />
	<input type="password" bind:value={password} placeholder="Password" />
	<button type="submit">Log in</button>
</form>
