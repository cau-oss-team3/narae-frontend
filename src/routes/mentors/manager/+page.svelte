<script>
	import { page } from '$app/stores';
	import {onDestroy, onMount} from 'svelte';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { PUBLIC_API_SERVER } from '$env/static/public';
	import { alertData } from '../../../stores.js';
	import {
		Button,
		Card,
		CardBody,
		Container,
		Form,
		FormGroup,
		Input,
		Row
	} from '@sveltestrap/sveltestrap';
	import {userData} from "$lib/auth.js";

	let userDataValue;
	const unsubscribeUserData = userData.subscribe((value) => {
		userDataValue = value;
	});
	onDestroy(() => {
		unsubscribeUserData
	});

	let id = '';

	onMount(() => {
		id = $page.url.searchParams.get('id');
	});

	let validated = false;
	let values = {};

	/* TODO 삭제
    const dummyData = {
        mentor_detail: {
            mentor_name: "테스트 멘토 이름",
            mentor_field: 2,
            mentor_sticc: {
                situation: "situation",
                task: "task",
                intent: "intent",
                concern: "concern",
                calibrate: "calibrate"
            }
        }
    };

     */

	onMount(() => {
		if (id != null) {
			// 멘토 id가 있는경우 편집 모드
			getMentor();
		}
		//없는 경우 멘토 추가 모드
	});

	// 맨토 정보 불러오기
	async function getMentor() {
		/* TODO 삭제
        values = {
            mentor_name: dummyData.mentor_detail.mentor_name,
            mentor_field0: dummyData.mentor_detail.mentor_field == 0 || dummyData.mentor_detail.mentor_field == 2,
            mentor_field1: dummyData.mentor_detail.mentor_field == 1 || dummyData.mentor_detail.mentor_field == 2,
            situation: dummyData.mentor_detail.mentor_sticc.situation,
            task: dummyData.mentor_detail.mentor_sticc.task,
            intent: dummyData.mentor_detail.mentor_sticc.intent,
            concern: dummyData.mentor_detail.mentor_sticc.concern,
            calibrate: dummyData.mentor_detail.mentor_sticc.calibrate,
        };

         */

		const res = await fetch(PUBLIC_API_SERVER + '/mentors2/' + id, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': userDataValue.token
			}
		});

		const json = await res.json();

		if (json.isSuccess && json.mentor_detail != null) {
			values = {
				mentor_name: json.mentor_detail.mentor_name,
				mentor_field0: json.mentor_detail.mentor_field == 0 || json.mentor_detail.mentor_field == 2,
				mentor_field1: json.mentor_detail.mentor_field == 1 || json.mentor_detail.mentor_field == 2,
				situation: json.mentor_detail.mentor_sticc.situation,
				task: json.mentor_detail.mentor_sticc.task,
				intent: json.mentor_detail.mentor_sticc.intent,
				concern: json.mentor_detail.mentor_sticc.concern,
				calibrate: json.mentor_detail.mentor_sticc.calibrate
			};
		} else {
			goto(base + '/mentors'); // 멘토 정보가 없는경우 멘토 리스트 페이지로 넘겨줌
			alert('멘토 정보를 불러오는데 문제가 생겼습니다.');
			//alertData.set({code:res.status, err:json.err});
		}
	}

	const convertToApiField = () => {
		if (values.mentor_field0 == false && values.mentor_field1 == false) {
			// 둘다 체크 안함
			return null;
		}

		//백엔드 만 체크
		let field = 0;

		if (values.mentor_field1 == true) {
			//프론트 만 체크
			field = 1;
		}

		if (values.mentor_field0 == true && values.mentor_field1 == true) {
			//둘다 체크
			field = 2;
		}

		return field;
	};

	// 멘토 생성
	async function doCreate() {
		if (convertToApiField() == null) {
			alert('최소 1가지 이상의 분야를 선택해야합니다!');
			return;
		}

		const data = {
			mentor_name: values.mentor_name,
			mentor_field: convertToApiField(),
			mentor_sticc: {
				situation: values.situation,
				task: values.task,
				intent: values.intent,
				concern: values.concern,
				calibrate: values.calibrate
			}
		};

		const res = await fetch(PUBLIC_API_SERVER + '/mentors2', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': userDataValue.token
			},
			body: JSON.stringify(data)
		});

		const json = await res.json();

		if (json.isSuccess) {
			goto(base + '/mentors'); //멘토 리스트 페이지로 넘겨줌
			alert('멘토 생성 성공!');
		} else {
			alertData.set({ code: res.status, err: json.err });
		}
	}

	// 멘토 수정
	async function doUpdate() {
		if (convertToApiField() == null) {
			alert('최소 1가지 이상의 분야를 선택해야합니다!');
			return;
		}

		const data = {
			mentor_name: values.mentor_name,
			mentor_field: convertToApiField(),
			mentor_sticc: {
				situation: values.situation,
				task: values.task,
				intent: values.intent,
				concern: values.concern,
				calibrate: values.calibrate
			}
		};

		const res = await fetch(PUBLIC_API_SERVER + '/mentors2/' + id, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': userDataValue.token
			},
			body: JSON.stringify(data)
		});

		const json = await res.json();

		if (json.isSuccess) {
			goto(base + '/mentors'); //멘토 리스트 페이지로 넘겨줌
			alert('멘토 수정 성공!');
		} else {
			if (res.status === 404) {
				goto(base + '/mentors'); // 멘토 정보가 없는경우 멘토 리스트 페이지로 넘겨줌
				alert('해당 멘토 정보가 없습니다.');
			} else {
				alertData.set({ code: res.status, err: json.err });
			}
		}
	}
</script>
<svelte:head>
	{#if id != null}
		<title>멘토 정보 수정</title>
	{:else}
		<title>멘토 생성</title>
	{/if}
</svelte:head>


<Container class="py-5 h-100">

	<style>
		.card-container {
			max-width: 800px;
			margin: auto;
		}
		.card-header {
			background-color: #f8f9fa;
			border-bottom: 1px solid #dee2e6;
			padding: 20px;
			border-top-left-radius: 1rem;
			border-top-right-radius: 1rem;
		}
		.card-body {
			padding: 40px;
		}
		.form-group {
			margin-bottom: 20px;
		}
		.section-title {
			margin-top: 30px;
			margin-bottom: 20px;
			font-weight: bold;
			color: #495057;
		}
		.button-container {
			margin-top: 30px;
		}
		.form-group label {
			display: block;
			max-width: 100%;
			white-space: normal;
			overflow-wrap: break-word;
		}
		@media (max-width: 600px) {
			.card-body {
				padding: 20px;
			}
			.form-group label {
				font-size: 0.9rem;
			}
			.section-title {
				font-size: 1.1rem;
			}
			.button-container {
				margin-top: 20px;
			}
			.form-group input[type="textarea"] {
				width: 100%;
				box-sizing: border-box;
			}
		}
	</style>
	<Row class="d-flex justify-content-center">
		<Card class="shadow-2-strong card-container">
			<div class="card-header text-center">
				<h3>{id != null ? '멘토 정보 수정' : '나만의 멘토를 생성해보세요'}</h3>
			</div>
			<CardBody class="card-body text-center">
				<Form
						{validated}
						action="javascript:void(0);"
						on:submit={(e) => (id != null ? doUpdate() : doCreate())}
						method="post"
						id="authForm"
				>
					<ul class="list-group list-group-flush">
						<li class="list-group-item">
							<FormGroup floating label="멘토 이름" class="form-group">
								<Input
										type="text"
										name="mentor_name"
										id="mentor_name"
										required
										bind:value={values.mentor_name}
								/>
							</FormGroup>

							<h5 class="section-title">분야 선택 (하나만 선택)</h5>
							<FormGroup class="form-group">
								<Input
										type="checkbox"
										label="백엔드"
										id="mentor_field0"
										bind:checked={values.mentor_field0}
								/>
								<Input
										type="checkbox"
										label="프론트"
										id="mentor_field1"
										bind:checked={values.mentor_field1}
								/>
							</FormGroup>
						</li>
						<li class="list-group-item">
							<h5 class="section-title">자세히 작성해주시면 멘토님께 도움이 됩니다.</h5>
							<FormGroup floating label="[상황] 현재 상황을 설명해 주세요." class="form-group">
								<Input
										type="textarea"
										name="situation"
										id="situation"
										required
										bind:value={values.situation}
								/>
							</FormGroup>

							<FormGroup floating label="[작업] 수행하고 싶은 작업을 말해 주세요." class="form-group">
								<Input
										type="textarea"
										name="task"
										id="task"
										required
										bind:value={values.task}
								/>
							</FormGroup>

							<FormGroup floating label="[목적] 이 작업의 목적이나 의도를 알려 주세요." class="form-group">
								<Input
										type="textarea"
										name="intent"
										id="intent"
										required
										bind:value={values.intent}
								/>
							</FormGroup>

							<FormGroup floating label="[걱정] 걱정되는 부분이 있나요? (ex. 최신 자바 문법을 모릅니다.)" class="form-group">
								<Input
										type="textarea"
										name="concern"
										id="concern"
										required
										bind:value={values.concern}
								/>
							</FormGroup>

							<FormGroup floating label="[조율] 추가로 알아야 할 사항이나 요청하고 싶은 것이 있다면 말씀해 주세요." class="form-group">
								<Input
										type="textarea"
										name="calibrate"
										id="calibrate"
										required
										bind:value={values.calibrate}
								/>
							</FormGroup>
						</li>
					</ul>

					<div class="button-container">
						<Button
								class="btn-custom"
								block={true}
								color="primary"
								size="lg"
								type="submit">{id != null ? '수정' : '제출'}</Button>
					</div>
				</Form>
			</CardBody>
		</Card>
	</Row>
</Container>
