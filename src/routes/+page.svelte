<script>
	import { onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { Button, Container } from '@sveltestrap/sveltestrap';
	import {userData} from "$lib/auth.js";

	let userDataValue;

	const unsubscribe = userData.subscribe((value) => {
		userDataValue = value;
	});

	onDestroy(unsubscribe);

	const redirect = () => {
		if (userDataValue != null) {
			goto(base + '/mentors'); //멘토 리스트 페이지로 넘겨줌
		} else {
			goto(base + '/auth'); //로그인 페이지로 넘겨줌
		}
	};

	if (userDataValue != null) {
		redirect();
	}
</script>

<svelte:head>
	<title>Narae: Your Personal AI Mentor</title>
</svelte:head>

<Container class="py-5 text-center container-fluid">
	<h1 class="container">Narae: Your Personal AI Mentor</h1>

	<Button
		class=""
		active={false}
		block={false}
		children=""
		close={false}
		color="primary"
		disabled={false}
		href=""
		outline={false}
		size="md"
		style="margin-top: 50px;"
		on:click={redirect}
		value="">서비스 사용해보기</Button
	>
</Container>
