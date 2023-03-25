<script lang="ts">
	import supabaseclient from '../../scripts/supabaseutil';
	import { login } from './login';

	let email = '';
	let password = '';
	let usermail: string | undefined = '';

	async function submitlogin() {
		const data = await login(email, password);
		if (data) {
			usermail = data.user?.email;
		}

		email = '';
		password = '';
	}

	async function logout() {
		console.log('logout');
		let data = await supabaseclient.auth.signOut();
		usermail = '';
		console.log(data);
	}
</script>

<form on:submit|preventDefault={submitlogin}>
	{#if usermail}
		<p>Logged in as {usermail}</p>
	{:else}
		<p>Not logged in</p>
	{/if}
	<input type="email" bind:value={email} placeholder="Email" />
	<input type="password" bind:value={password} placeholder="Password" />
	<button type="submit">Log in</button>
</form>

<button type="button" on:click={logout}>Log out</button>
