<script context="module">
	import { FakeWebSocketServer } from '$lib/FakeWebSocketServer.js';
</script>

<script>
	import { onDestroy, onMount } from 'svelte';

	/**
	 * @type {any[]}
	 */
	let messages = [];
	let inputMessage = '';
	/**
	 * @type {FakeWebSocketServer}
	 */
	let fakeServer = new FakeWebSocketServer();

	// Function to add a new message to the chat
	/**
	 * @param {{ text: string; sender: string; }} message
	 */
	function addMessage(message) {
		messages = [...messages, message];
	}

	// Function to send a message
	function sendMessage() {
		if (inputMessage.trim() !== '') {
			addMessage({ text: inputMessage, sender: 'You' });
			inputMessage = '';

			// Simulate sending message to the server (in real scenario, this would be WebSocket communication)
			setTimeout(() => {
				const randomMessage = fakeServer.generateRandomMessage();
				addMessage({ text: randomMessage, sender: 'Server' });
			}, 500);
		}
	}

	onMount(() => {
		// Initialize fake server
		fakeServer.start();
	});

	onDestroy(() => {
		// Clean up fake server
		fakeServer.stop();
	});
</script>

<h1>Welcome to Narae Mentoring</h1>

<div class="chat-container">
	{#each messages as message, index}
		<div class="message" class:own-message={message.sender === 'You'}>
			<span class="sender">{message.sender}:</span>
			<span class="text">{message.text}</span>
		</div>
	{/each}
</div>

<div class="input-container">
	<input type="text" bind:value={inputMessage} placeholder="Type your message..." />
	<button on:click={sendMessage}>Send</button>
</div>

<style>
	.chat-container {
		margin-bottom: 20px;
		overflow-y: scroll;
		height: 300px;
	}

	.message {
		margin-bottom: 10px;
	}

	.own-message {
		text-align: right;
	}

	.sender {
		font-weight: bold;
		margin-right: 5px;
	}

	.input-container {
		display: flex;
	}

	input[type='text'] {
		flex: 1;
		margin-right: 10px;
	}

	button {
		padding: 5px 10px;
		background-color: #007bff;
		color: #fff;
		border: none;
		cursor: pointer;
	}
</style>
