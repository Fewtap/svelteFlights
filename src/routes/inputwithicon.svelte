<!-- InputWithIcon.svelte -->
<script>
	export let icon = '';
	export let placeholder = '';
</script>

<div class="input-container">
	<i class="{icon} input-icon" />
	<input type="text" {placeholder} />
</div>

<style>
	.input-container {
		display: flex;
		align-items: center;
	}

	.input-icon {
		margin-right: 0.5rem;
	}

	input {
		flex-grow: 1;
	}
</style>
