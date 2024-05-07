<script>
	import {
		Button,
		Card,
		CardBody,
		CardFooter,
		CardHeader,
		CardSubtitle,
		CardText,
		CardTitle,
		Container,
		Modal,
		ModalBody,
		ModalFooter,
		ModalHeader
	} from '@sveltestrap/sveltestrap';
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';
	import { userData, alertData } from '../../stores.js';
	import { PUBLIC_API_SERVER } from '$env/static/public';
	import {onDestroy, onMount} from 'svelte';

	let userDataValue;
	const unsubscribeUserData = userData.subscribe((value) => {
		userDataValue = value;
	});
	onDestroy(() => {
		unsubscribeUserData
	});

	let open = [];

	const toggle = (i) => {
		open[i] = !open[i];
	};

	let mentors = [];

	//TODO 삭제
	/*
    let dummyMentors = [
        {
            "id": "mentorid1",
            "name": "멘토이름",
            "daily_action": "오늘의 할일 1"
        },
        {
            "id": "mentorid2",
            "name": "맨토이름 2",
            "daily_action": "오늘의 할일 2"
        }
    ];

     */

	onMount(() => {
		// Initialize fake server
		getMentorList();
	});

	// 맨토 리스트 불러오기
	async function getMentorList() {
		console.log(userData);
		const res = await fetch(PUBLIC_API_SERVER + '/mentors2', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': userDataValue.token
			}
		});

		const json = await res.json();

		if (json.isSuccess) {
			/* TODO 삭제
            open = Array.from({length: dummyMentors.length}, () => false);
            mentors = dummyMentors;
             */

			open = Array.from({ length: json.mentors.length }, () => false);
			mentors = json.mentors;
		} else {
			alertData.set({ code: res.status, err: json.err });
		}
	}

	// chat 페이지로 보내기
	const goToChat = (id) => {
		if (id != null) {
			goto(base + '/chat?id=' + id); //chat 페이지로 넘겨줌
		}
	};

	// mentors - manager 페이지 생성모드로 보내기
	const goToCreateMentor = () => {
		goto(base + '/mentors/manager'); //멘토 매니저 페이지 생성모드로 넘겨줌
	};

	// mentors - manager 페이지 수정모드로 보내기
	const goToEditMentor = (id) => {
		if (id != null) {
			goto(base + '/mentors/manager?id=' + id); //멘토 매니저 페이지 수정모드로 넘겨줌
		}
	};

	// mentor 삭제
	async function removeMentor(id) {
		const res = await fetch(PUBLIC_API_SERVER + '/mentors2/' + id, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': userDataValue.token
			}
		});

		const json = await res.json();

		if (json.isSuccess) {
			getMentorList(); //멘토 리스트 다시 불러오기
		} else {
			alertData.set({ code: res.status, err: json.err });
		}
	}
</script>

<Container fluid>
	{#each mentors as mentor, index}
		<Card>
			<CardHeader>
				<CardTitle>{mentor.name}</CardTitle>
			</CardHeader>
			<CardBody>
				{#if mentor.daily_action != null}
					<CardSubtitle>Daily Action</CardSubtitle>
					<br />
					<CardText>{mentor.daily_action}</CardText>
				{/if}
			</CardBody>
			<CardFooter class="d-flex justify-content-end">
				<Modal isOpen={open[index]} backdrop={false}>
					<ModalHeader>멘토 삭제</ModalHeader>
					<ModalBody>
						"{mentor.name}"을/를 삭제하시겠습니까?
					</ModalBody>
					<ModalFooter>
						<Button
							color="danger"
							on:click={() => {
								toggle(index);
								removeMentor(mentor.id);
							}}>삭제</Button
						>
						<Button color="secondary" on:click={() => toggle(index)}>취소</Button>
					</ModalFooter>
				</Modal>
				<Button
					class=""
					active={false}
					block={false}
					children=""
					close={false}
					color="danger"
					disabled={false}
					href=""
					outline={false}
					size="md"
					style=""
					on:click={() => (open[index] = true)}
					value="">삭제</Button
				>
				<Button
					class=""
					active={false}
					block={false}
					children=""
					close={false}
					color="success"
					disabled={false}
					href=""
					outline={false}
					size="md"
					style="margin-left: 10px;"
					on:click={() => goToEditMentor(mentor.id)}
					value="">수정</Button
				>
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
					style="margin-left: 10px;"
					on:click={() => goToChat(mentor.id)}
					value="">대화하기</Button
				>
			</CardFooter>
		</Card>
		<br />
	{/each}

	<Container
		fluid
		class="d-flex justify-content-end"
		style="margin-top: 30px; padding-bottom: 30px;"
	>
		<Button
			class=""
			active={false}
			block={false}
			children=""
			close={false}
			color="secondary"
			disabled={false}
			href=""
			outline={false}
			size="md"
			on:click={() => goToCreateMentor()}
			value="">멘토 추가하기</Button
		>
	</Container>
</Container>
