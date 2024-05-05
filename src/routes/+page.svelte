<script>
	import { onDestroy } from 'svelte';
	import { userData } from '../stores.js';
	import { goto } from '$app/navigation';
	import { Button, Container } from '@sveltestrap/sveltestrap';

	let userDataValue;

	const unsubscribe = userData.subscribe((value) => {
		userDataValue = value;
	});

	onDestroy(unsubscribe);

	const redirect = () => {
		if (userDataValue != null) {
			goto({ base } + '/mentors'); //멘토 리스트 페이지로 넘겨줌
		} else {
			goto({ base } + '/auth'); //로그인 페이지로 넘겨줌
		}
	};
</script>

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
