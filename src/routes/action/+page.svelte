<!-- TODO 개발 -->
<script>
    import {onDestroy, onMount} from 'svelte';
    import {page} from '$app/stores';
    import {PUBLIC_API_SERVER} from '$env/static/public';
    import {alertData} from '../../stores.js';
    import {goto} from '$app/navigation';
    import {
        Button,
        Card,
        CardBody,
        CardTitle, Col,
        Container, Form, FormGroup, Input, Modal, ModalBody, ModalFooter, ModalHeader, Row,
    } from '@sveltestrap/sveltestrap';
    import {userData} from "$lib/auth.js";

    let id = '';
    let userDataValue;
    let actionList = [];
    let actionRecommendList = [];

    let validated = false;
    let input_temp_data = '';

    let open = false;

    const toggle = () => {
        open = !open;
    };

    const unsubscribeUserData = userData.subscribe(async (value) => {
        userDataValue = value;
    });

    onDestroy(() => {
        unsubscribeUserData
    });

    onMount(async () => {
        id = $page.url.searchParams.get('id'); // 다른 페이지에서 파라미터로 넘어오는 멘토 ID임
        if (!id) {
            await goto('/mentors'); // Redirect if no ID is provided
            alert('멘토 ID가 없습니다!');
            return;
        }

        await getActionList();
    });

    // get Action List
    async function getActionList() {
        const res = await fetch(PUBLIC_API_SERVER + '/action/current/' + id, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': userDataValue.token
            }
        });

        const json = await res.json();
        console.log("Action List:", json);

        if (json.isSuccess) {
            actionList = json.action_list;
        } else {
            alertData.set({code: res.status, err: json.err});
        }
    }

    // Action Accept
    async function acceptAction(isAccept, candidate) {
        const data = {
            id: id,
            is_accept: isAccept,
            action: candidate
        };

        const res = await fetch(PUBLIC_API_SERVER + '/action/accept', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': userDataValue.token
            },
            body: JSON.stringify(data)
        });

        const json = await res.json();

        if (json.isSuccess) {
            await getActionList();
        } else {
            alertData.set({code: res.status, err: json.err});
        }
    }

    // Action Result
    async function postActionResult(resultCode, candidate) {
        const data = {
            id: id,
            result_code: resultCode,
            action: candidate,
            chat_data: input_temp_data
        };

        const res = await fetch(PUBLIC_API_SERVER + '/action/result', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': userDataValue.token
            },
            body: JSON.stringify(data)
        });

        const json = await res.json();

        if (json.isSuccess) {
            await getActionList();
        } else {
            alertData.set({code: res.status, err: json.err});
        }
    }

    // get Recommend Action
    async function recommendAction() {
        const res = await fetch(PUBLIC_API_SERVER + '/action/recommend/' + id, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': userDataValue.token
            }
        });

        const json = await res.json();
        console.log("Action Recommend List:", json);

        if (json.isSuccess) {
            actionRecommendList = json.action_list;
            open = true;
        } else {
            alertData.set({code: res.status, err: json.err});
        }
    }

</script>

<svelte:head>
    <title>수락한 Action 리스트</title>
</svelte:head>

<Container fluid>
    {#each actionList as action}
        <Card>
            <CardBody>
                <CardTitle>{action}</CardTitle>

                <Form {validated} action="javascript:void(0);"
                      on:submit={(e) =>
									postActionResult(e.submitter.value, action)}
                      method="post">
                    <Row>
                        <Col>
                            <FormGroup
                                    floating
                                    label="왜 성공 / 실패 / 보류 했는지 짧게 작성해주세요."
                                    class="form-outline mb-4">
                                <Input
                                        type="text"
                                        name="input_temp"
                                        required
                                        bind:value={input_temp_data}
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Container class="d-flex justify-content-end">
                            <Button
                                    class="action-button"
                                    active={false}
                                    block={false}
                                    close={false}
                                    color="warning"
                                    disabled={false}
                                    outline={false}
                                    size="md"
                                    value="2">보류
                            </Button>
                            <Button
                                    class="action-button"
                                    active={false}
                                    block={false}
                                    close={false}
                                    color="danger"
                                    disabled={false}
                                    outline={false}
                                    size="md"
                                    value="0">실패
                            </Button>
                            <Button
                                    class="action-button"
                                    active={false}
                                    block={false}
                                    close={false}
                                    color="success"
                                    disabled={false}
                                    outline={false}
                                    size="md"
                                    value="1">완수
                            </Button>
                        </Container>
                    </Row>
                </Form>
            </CardBody>
        </Card>
        <br />
    {/each}

    <Container
            fluid
            class="d-flex justify-content-end"
            style="margin-top: 30px; padding-bottom: 30px;"
    >
        <Modal isOpen={open} backdrop={false}>
            <ModalHeader>Action 추천</ModalHeader>
            <ModalBody>
                수락할 Action을 선택해 주세요.
            </ModalBody>
            <ModalFooter>
                {#each actionRecommendList as recommendAction}
                <Button
                        color="info"
                        on:click={() => {
								toggle();
								acceptAction(true, recommendAction);
							}}>{recommendAction}</Button
                >
                {/each}
                <Button color="secondary" on:click={() => toggle()}>취소</Button>
            </ModalFooter>
        </Modal>
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
                on:click={() => recommendAction()}
                value="">Action 추천받기</Button
        >
    </Container>
</Container>

<style>
    :global(.action-button) {
        margin-right: 10px;
    }
</style>


<!-- TODO 테스트 데이터
let actionList = ['수락한 Action 1', '수락한 Action 2', '수락한 Action 3'];

let actionRecommendList = ['내일을 위한 Action', '당신을 위한 위한 Action', '오늘 당장 할 수 있는 Action'];
!-->
