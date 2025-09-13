<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	let username = '';
	let email = '';
	let password = '';
	let confirmPassword = '';
	let loading = false;
	let error = '';

	// Redirect if already logged in
	onMount(() => {
		if ($page.data.user) {
			goto('/');
		}
	});

	async function handleSubmit() {
		// Basic validation
		if (!username || !email || !password || !confirmPassword) {
			error = 'Please fill in all fields';
			return;
		}

		if (password !== confirmPassword) {
			error = 'Passwords do not match';
			return;
		}

		loading = true;
		error = '';

		try {
			const response = await fetch('/api/auth/signup', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					username: username.trim(),
					email: email.trim(),
					password
				})
			});

			const data = await response.json();

			if (response.ok) {
				// Redirect to home page
				window.location.href = '/';
			} else {
				error = data.error || 'Registration failed';
			}
		} catch (err) {
			console.error('Signup error:', err);
			error = 'Network error. Please try again.';
		} finally {
			loading = false;
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			handleSubmit();
		}
	}
</script>

<svelte:head>
	<title>Sign Up - Loggd</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-base-200 py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-md w-full space-y-8">
		<div>
			<h2 class="mt-6 text-center text-3xl font-extrabold text-base-content">
				Create your account
			</h2>
			<p class="mt-2 text-center text-sm text-base-content/70">
				Or
				<a href="/login" class="font-medium text-primary hover:text-primary-focus">
					sign in to your existing account
				</a>
			</p>
		</div>

		<form class="mt-8 space-y-6" on:submit|preventDefault={handleSubmit}>
			<div class="space-y-4">
				<div>
					<label for="username" class="block text-sm font-medium text-base-content">
						Username
					</label>
					<input
						id="username"
						name="username"
						type="text"
						autocomplete="username"
						required
						class="input input-bordered w-full mt-1"
						placeholder="Choose a username"
						bind:value={username}
						on:keydown={handleKeydown}
						disabled={loading}
					/>
					<p class="text-xs text-base-content/60 mt-1">
						3-30 characters, letters, numbers, hyphens, and underscores only
					</p>
				</div>

				<div>
					<label for="email" class="block text-sm font-medium text-base-content">
						Email Address
					</label>
					<input
						id="email"
						name="email"
						type="email"
						autocomplete="email"
						required
						class="input input-bordered w-full mt-1"
						placeholder="Enter your email address"
						bind:value={email}
						on:keydown={handleKeydown}
						disabled={loading}
					/>
				</div>

				<div>
					<label for="password" class="block text-sm font-medium text-base-content">
						Password
					</label>
					<input
						id="password"
						name="password"
						type="password"
						autocomplete="new-password"
						required
						class="input input-bordered w-full mt-1"
						placeholder="Create a password"
						bind:value={password}
						on:keydown={handleKeydown}
						disabled={loading}
					/>
					<p class="text-xs text-base-content/60 mt-1">
						At least 8 characters with uppercase, lowercase, and number
					</p>
				</div>

				<div>
					<label for="confirmPassword" class="block text-sm font-medium text-base-content">
						Confirm Password
					</label>
					<input
						id="confirmPassword"
						name="confirmPassword"
						type="password"
						autocomplete="new-password"
						required
						class="input input-bordered w-full mt-1"
						placeholder="Confirm your password"
						bind:value={confirmPassword}
						on:keydown={handleKeydown}
						disabled={loading}
					/>
				</div>
			</div>

			{#if error}
				<div class="alert alert-error">
					<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<span>{error}</span>
				</div>
			{/if}

			<div>
				<button
					type="submit"
					class="btn btn-primary w-full"
					class:loading
					disabled={loading}
				>
					{#if loading}
						Creating account...
					{:else}
						Create account
					{/if}
				</button>
			</div>

			<div class="text-center">
				<p class="text-sm text-base-content/70">
					Already have an account?
					<a href="/login" class="font-medium text-primary hover:text-primary-focus">
						Sign in here
					</a>
				</p>
			</div>
		</form>
	</div>
</div>
