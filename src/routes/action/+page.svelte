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
    import SvelteMarkdown from "svelte-markdown";

    let id = '';
    let userDataValue;
    let actionList = [];
    let motivation = '';
    let actionRecommendList = [];

    let validated = false;
    let input_temp_data = '';

    let open = false;
    let loading = false;
    let actionLoading = false;

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

        let curriculum = await getCurriculum();
        if (curriculum === null || curriculum === undefined || curriculum.trim().length === 0) {
            alert('해당 멘토의 커리큘럼이 없습니다. 커리큘럼을 먼저 생성해주세요.');
            await goto('/mentors');
            return;
        }
        await getActionList();

    });

    async function getCurriculum() {
        const res = await fetch(PUBLIC_API_SERVER + '/prompt/' + id + '/curriculum', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': userDataValue.token
            },
        });

        const json = await res.json();
        if (!res.ok) {
            alertData.set({code: res.status, err: json});
        }
        return json["CURRICULUM"];
    }

    // get Action List
    async function getActionList() {
        const res = await fetch(PUBLIC_API_SERVER + '/prompt/' + id + '/daily-actions', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': userDataValue.token
            },
        });

        const json = await res.json();
        if (!res.ok) {
            alertData.set({code: res.status, err: json.err});
        }
        actionList = json;
    }

    // Action Accept
    async function acceptAction(candidate) {
        const data = {
            action: candidate
        };

        const res = await fetch(PUBLIC_API_SERVER + '/prompt/' + id + '/daily-actions/current', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': userDataValue.token
            },
            body: JSON.stringify(data)
        });

        const json = await res.json();
        if (!res.ok) {
            alertData.set({code: res.status, err: json.err});
        }

        await getActionList();
    }

    // Action Result
    async function postActionResult(input_data, isSuccess) {
        actionLoading = true;
        const data = {
            success: isSuccess,
            comment: input_data
        };
        const res = await fetch(PUBLIC_API_SERVER + '/prompt/' + id +'/daily-actions/current', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': userDataValue.token
            },
            body: JSON.stringify(data)
        });

        const json = await res.json();
        if (!res.ok) {
            alertData.set({code: res.status, err: json.detail});
        }

        await getActionList();
        actionLoading = false;
    }

    // get Recommend Action
    async function recommendAction() {
        open = true;
        loading = true;

        const res = await fetch(PUBLIC_API_SERVER + '/prompt/' + id + '/action-suggestion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': userDataValue.token
            },
            body: JSON.stringify({hint: ""})
        });

        const json = await res.json();
        if (!res.ok) {
            alertData.set({code: res.status, err: json.err});
            loading = false;
            return;
        }

        for (const key in json) {
            if (key.startsWith('ACTION') && key !== 'ACTIONS') {
                actionList.push(json[key]);
            }
        }

        actionRecommendList = json.actions;
        motivation = json.motivation;
        loading = false;
    }
</script>

<svelte:head>
    <title>수락한 Action 리스트</title>
</svelte:head>


<Container fluid>
    <style>
        .modal-body {
            padding: 20px;
        }

        .modal-footer {
            padding: 15px;
            display: flex;
            justify-content: space-between;
        }

        .button-container {
            margin-top: 20px;
            padding-bottom: 20px;
            display: flex;
            justify-content: flex-end;
        }

        .motivation-text {
            margin-top: 20px;
            font-weight: bold;
            text-align: center;
        }

        .action-button {
            margin: 5px 10px 5px 0;
            border-radius: 5px;
        }

        .recommend-button {
            background-color: #032952;
            color: white;
            border: none;
            padding: 10px 20px;
            margin: 5px 0;
            border-radius: 5px;
            cursor: pointer;
        }

        .recommend-button:hover {
            background-color: #063467;
        }

        .cancel-button {
            background-color: #6c757d;
            color: white;
            border: none;
            padding: 10px 20px;
            margin: 5px 0;
            border-radius: 5px;
            cursor: pointer;
        }

        .cancel-button:hover {
            background-color: #5a6268;
        }
    </style>

    {#each actionList as action}
        <Card style="margin-bottom: 20px;">
            <CardBody style="background-color: {action.is_done === false ? '#f8f9fa' : '#ffffff'}; border: 1px solid #dee2e6; border-radius: 5px;">
                <CardTitle style="font-weight: bold; margin-bottom: 15px;"><SvelteMarkdown source={action.action} /></CardTitle>
                <Form {validated} action="javascript:void(0);" on:submit={(e) => postActionResult(e.submitter.value, action)} method="post">
                    {#if action.is_active === false && action.is_done === false}
                        <Row>
                            <Col>
                                <FormGroup floating label="포기한 Action입니다." class="form-outline mb-4">
                                    <Input
                                            type="text"
                                            name="input_temp"
                                            required
                                            style="background-color: #e9ecef; color: #6c757d;"
                                            disabled
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                    {:else if action.is_active === false && action.is_done === true}
                        <Row>
                            <Col>
                                <p><SvelteMarkdown source={action.feedback} /></p>
                            </Col>
                        </Row>
                    {:else}
                        <Row>
                            <Col>
                                <FormGroup floating label="Action을 수행하셨나요? 짧은 후기를 작성해주세요." class="form-outline mb-4">
                                    <Input
                                            type="text"
                                            name="input_temp"
                                            required
                                            bind:value={input_temp_data}
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                        <Container class="d-flex justify-content-end">
                            {#if actionLoading}
                                <div class="loading-indicator">처리 중입니다...</div>
                            {:else}
                                <Button class="action-button" color="danger" on:click={() => postActionResult(input_temp_data, false)}>실패</Button>
                                <Button class="action-button" color="success" on:click={() => postActionResult(input_temp_data, true)}>완수</Button>
                            {/if}
                        </Container>
                    {/if}
                </Form>
            </CardBody>
        </Card>
    {/each}

    <Container fluid class="button-container">
        <Modal isOpen={open} backdrop={true}>
            <ModalHeader>Action 추천</ModalHeader>
            <ModalBody class="modal-body">
                {#if loading}
                    <div>불러오는 중입니다. 잠시만 기다려주세요.</div>
                {:else}
                    <div class="motivation-text">{motivation}</div>
                    <div style="margin-bottom: 20px; margin-top: 30px;">추천 Action 리스트 (하나를 선택하세요.)</div>
                    {#each actionRecommendList as recommendAction}
                        <Button class="recommend-button" on:click={() => { toggle(); acceptAction(recommendAction); }}><SvelteMarkdown source={recommendAction} /></Button>
                    {/each}
                {/if}
            </ModalBody>
            <ModalFooter class="modal-footer">
                <Button class="cancel-button" on:click={() => toggle()}>취소</Button>
            </ModalFooter>
        </Modal>
        <Button class="recommend-button" on:click={() => recommendAction()}>Action 추천받기</Button>
    </Container>
</Container>
