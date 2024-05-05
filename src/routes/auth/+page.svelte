<script>
	import {
		Button,
		Card,
		CardBody,
		Col,
		Container,
		Form,
		FormGroup,
		Input,
		Row
	} from '@sveltestrap/sveltestrap';

	import { goto } from '$app/navigation';
	import { userData, alertData } from '../../stores.js';
	import { PUBLIC_API_SERVER } from '$env/static/public';

	let validated = false;
	let values = {};

	// 로그인
	async function doLogin() {
		const data = {
			email: values.email,
			password: values.password
		};

		const res = await fetch(PUBLIC_API_SERVER + '/auth/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		});

		const json = await res.json();

		if (json.isSuccess) {
			userData.set({ email: values.email, token: json.token });
			goto('/mentors'); //멘토 리스트 페이지로 넘겨줌
		} else {
			alertData.set({ code: res.status, err: json.err });
		}
	}
</script>

<Container class="vh-100">
	<Container class="py-5 h-100">
		<Row class="d-flex justify-content-center align-items-center h-50">
			<Col class="col-12 col-md-8 col-lg-6 col-xl-5">
				<Card class="shadow-2-strong" style="border-radius: 1rem;">
					<CardBody class="p-5 text-center">
						<h3 class="mb-5"><b>로그인 및 회원가입</b></h3>

						<Form
							{validated}
							action="javascript:void(0);"
							on:submit={(e) => doLogin()}
							method="post"
							id="authForm"
						>
							<FormGroup floating label="E-mail" class="form-outline mb-4">
								<Input
									type="email"
									name="email"
									id="typeEmail"
									required
									bind:value={values.email}
								/>
							</FormGroup>

							<FormGroup floating label="Password" class="form-outline mb-4 form-floating">
								<Input
									type="password"
									name="password"
									id="typePassword"
									class="form-control form-control-lg"
									placeholder="Password"
									required
									bind:value={values.password}
								/>
							</FormGroup>

							<Button
								class=""
								active={false}
								block={true}
								children="Button"
								close={false}
								color="primary"
								disabled={false}
								href=""
								outline={false}
								size="lg"
								value="">로그인</Button
							>
						</Form>
					</CardBody>
				</Card>
			</Col>
		</Row>
	</Container>
</Container>
