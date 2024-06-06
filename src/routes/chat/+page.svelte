<!-- TODO 개발 -->
<script>
    import {onDestroy, onMount} from 'svelte';
    import {page} from '$app/stores';
    import {PUBLIC_API_SERVER, PUBLIC_WS_SERVER} from '$env/static/public';
    import {alertData} from '../../stores.js';
    import {goto} from '$app/navigation';
    import {base} from '$app/paths';
    import {
        Button,
        Card,
        CardBody,
        CardFooter,
        CardHeader,
        CardText,
        CardTitle,
        Col,
        Container,
        Form,
        FormGroup,
        Input,
        Row
    } from '@sveltestrap/sveltestrap';
    import {writable} from "svelte/store";
    import {userData} from "$lib/auth.js";
    import UserChat from "./UserChat.svelte";
    import MentorChat from "./MentorChat.svelte";
    import MentorInfo from "./MentorInfo.svelte";
    import PreviousChat from "./PreviousChat.svelte";
    import ActionRequestAccept from "./ActionRequestAccept.svelte";
    import ActionRequestResultReport from "./ActionRequestResultReport.svelte";
    import RequestFeedback from "./RequestFeedback.svelte";

    let id = '';
    let ws = null;
    let userDataValue;
    let tokenReady = false;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;

    const unsubscribeUserData = userData.subscribe(async (value) => {
        userDataValue = value;
        if (userDataValue && userDataValue.token) {
            tokenReady = true;
            if (id) {
                await getMentor();
                connectWebSocket();
            }
        }
    });

    onDestroy(() => {
        unsubscribeUserData
        if (ws) {
            ws.close(); // Close WebSocket when component is destroyed
        }
    });

    onMount(async () => {
        id = $page.url.searchParams.get('id'); // 다른 페이지에서 파라미터로 넘어오는 멘토 ID임
        if (!id) {
            await goto('/mentors'); // Redirect if no ID is provided
            return;
        }
        if (tokenReady) {  // Check if token is ready before connecting
            await getMentor();
            connectWebSocket();
        }
    });

    // Connect to WebSocket
    function connectWebSocket() {
        if (!userDataValue.token) {
            console.error('Token is not available.');
            return;
        }

        // truncate "Bearer " from the start of the token
        const token = userDataValue.token.split(' ')[1];
        console.log('Connecting to WebSocket with token:', token);

        ws = new WebSocket(`${PUBLIC_WS_SERVER}/chat/${id}?token=${token}`);
        ws.onopen = function () {
            console.log("Connected to the WebSocket.");
        };

        ws.onmessage = function (event) {
            const data = JSON.parse(event.data);
            addMessage(data);
            messagePending.set(false);
        };

        ws.onerror = function (error) {
            messagePending.set(false);
            console.error("WebSocket error:", error);
        };

        ws.onclose = () => {
            messagePending.set(false);
            console.log("WebSocket is closed now.");
            if (reconnectAttempts < maxReconnectAttempts) {
                let timeout = Math.pow(2, reconnectAttempts) * 1000;  // Exponential backoff
                setTimeout(connectWebSocket, timeout);
                reconnectAttempts++;
            } else {
                console.error("Max reconnect attempts reached.");
            }
        };
    }

    let validated = false;
    let element;
    let inputChatDisplayValue = '';

    const scrollToBottom = async (node) => {
        node.scroll({top: node.scrollHeight, behavior: 'smooth'});
    };

    $: if (chat_history != undefined && chat_history != null && chat_history.length > 0 && element) {
        console.log('Chat history:', chat_history);
        if (
            chat_history[chat_history.length - 1].chat_type > 3 ||
            (chat_history[chat_history.length - 1].candidates ?? []).length > 0
        ) {
            inputChatDisplayValue = 'none';
        }
        scrollToBottom(element);
    }

    let mentor_detail = null;
    let chat_history = [];

    let input_chat_data = '';
    let input_temp_data = '';
    let input_feedback_data = '';
    let messagePending = writable(false);

    // Function to add a new message to the chat
    /**
     * @param {{
     *    "seq": "int",
     *    "chat_type": "Chat Type Code <int>",
     *    "chat_data": "string",
     *    "candidates": [ "string" ],
     *    "timestamp": "UnixTime Milliseconds <int>",
     *    "visibility": "Boolean",
     * }} message
     */
    function addMessage(message) {
        chat_history = [...chat_history, message];
    }

    onMount(() => {
        if (id == null) {
            goto(base + '/mentors'); // 멘토 id가 없는 경우 멘토 리스트 페이지로 넘겨줌
            alert('멘토 ID가 없습니다!');
            return;
        }

        getMentor();
    });

    // 맨토 정보 불러오기
    async function getMentor() {
        if (!userDataValue?.token) {
            alert('불편을 드려 죄송합니다.\n현재 베타버전에서는 새로고침은 지원되지 않습니다.\n다시 로그인 부탁드립니다.');
            await goto(base + '/auth');
            return;
        }

        const res = await fetch(PUBLIC_API_SERVER + '/mentors2/' + id, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': userDataValue.token
            }
        });

        const json = await res.json();
        console.log("Mentor Detail:", json);

        if (json.isSuccess) {
            mentor_detail = json.mentor_detail;
            chat_history = json.chat_history;
        } else {
            alertData.set({code: res.status, err: json.err});
        }
    }

    // Action Accept
    async function acceptAction(index, isAccept, candidate) {
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
            chat_history[index].visibility = false;
            inputChatDisplayValue = '';

            addMessage(json.chat_data);
        } else {
            alertData.set({code: res.status, err: json.err});
        }
    }

    // Action Result
    async function postActionResult(index, resultCode, candidate, chatData) {
        const data = {
            id: id,
            result_code: resultCode,
            action: candidate,
            chat_data: chatData
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
            chat_history[index].visibility = false;
            inputChatDisplayValue = '';

            addMessage(json.chat_data);
        } else {
            alertData.set({code: res.status, err: json.err});
        }
    }

    // Feedback post
    async function postFeedback(index, type, content) {
        const data = {
            type: type,
            content: content,
        };

        const res = await fetch(PUBLIC_API_SERVER + '/feedback/' + id, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': userDataValue.token
            },
            body: JSON.stringify(data)
        });

        const json = await res.json();

        if (json.isSuccess) {
            chat_history[index].visibility = false;
            inputChatDisplayValue = '';

            addMessage(json.chat_data);
        } else {
            alertData.set({code: res.status, err: json.err});
        }
    }



    async function sendMessage() {
        const messageData = {
            chat_type: 0,
            chat_data: input_chat_data
        };

        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(messageData));
            addMessage({
                seq: -1,
                chat_type: 0,
                chat_data: messageData.chat_data,
                candidates: [],
                timestamp: new Date().getTime(),
                visibility: true
            });
            messagePending.set(true);  // Set pending message to true when sending
            input_chat_data = ''; // Clear input after sending
        } else {
            console.error('WebSocket is not open.');
        }
    }
</script>

<div id="chat_container" class="container-fluid" style="height: 75vh;">
    <div class="chat-list" bind:this={element} >
        {#each chat_history as message, index}
            {#if message.visibility}
                {#if message.chat_type == 0}
                    <UserChat message={message} />
                {:else if message.chat_type == 1}
                    <MentorChat message={message} mentor_detail={mentor_detail} />
                {:else if message.chat_type == 2} <!-- 멘토 정보 출력 -->
                    <MentorInfo mentor_detail={mentor_detail} />
                {:else if message.chat_type == 3}
                    <PreviousChat message={message} />
                {:else if message.chat_type == 4}
                    <ActionRequestAccept message={message}>
                        {#each message.candidates as candidate, index}
                            <Button
                                    class="action-button"
                                    active={false}
                                    block={false}
                                    close={false}
                                    color="secondary"
                                    disabled={false}
                                    outline={false}
                                    size="md"
                                    on:click={() => acceptAction(index, true, candidate)}
                                    value="">{candidate}</Button>
                        {/each}
                        <Button
                                active={false}
                                block={false}
                                close={false}
                                color="danger"
                                disabled={false}
                                outline={false}
                                size="md"
                                on:click={() => acceptAction(index, false, null)}
                                value="">거절하기</Button>
                    </ActionRequestAccept>
                {:else if message.chat_type == 5}
                    <ActionRequestResultReport message={message}>
                        <Form {validated} action="javascript:void(0);"
                                on:submit={(e) =>
									postActionResult(index, e.submitter.value, message.candidates[0], input_temp_data)}
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
                    </ActionRequestResultReport>
                {:else if message.chat_type == 6}
                    <RequestFeedback message={message} feedbackTitle="Action Feedback 요청" >
                        <Form {validated} action="javascript:void(0);"
                                on:submit={(e) =>
									postFeedback(index, 0, input_feedback_data)}
                                method="post">
                            <Row>
                                <Col>
                                    <FormGroup floating label="피드백을 작성해주세요." class="form-outline mb-4">
                                        <Input
                                                type="text"
                                                name="input_feedback"
                                                required
                                                bind:value={input_feedback_data}
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
                                            children=""
                                            close={false}
                                            color="primary"
                                            disabled={false}
                                            href=""
                                            outline={false}
                                            size="md">제출</Button>
                                </Container>
                            </Row>
                        </Form>
                    </RequestFeedback>
                {:else if message.chat_type == 7}
                    <RequestFeedback message={message} feedbackTitle="QnA Feedback 요청" >
                        <Form {validated} action="javascript:void(0);"
                                on:submit={(e) =>
									postFeedback(index, 1, input_feedback_data)}
                                method="post">
                            <Row>
                                <Col>
                                    <FormGroup
                                            floating
                                            label="피드백을 작성해주세요."
                                            class="form-outline mb-4">
                                        <Input
                                                type="text"
                                                name="input_feedback"
                                                required
                                                bind:value={input_feedback_data}
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
                                            children=""
                                            close={false}
                                            color="primary"
                                            disabled={false}
                                            href=""
                                            outline={false}
                                            size="md">제출</Button>
                                </Container>
                            </Row>
                        </Form>
                    </RequestFeedback>
                {:else if message.chat_type == 8}
                    <RequestFeedback message={message} feedbackTitle="학습 방향 Feedback 요청" >
                        <Form {validated} action="javascript:void(0);"
                                on:submit={(e) =>
									postFeedback(index, 2, input_feedback_data)}
                                method="post">
                            <Row>
                                <Col>
                                    <FormGroup
                                            floating
                                            label="피드백을 작성해주세요."
                                            class="form-outline mb-4">
                                        <Input
                                                type="text"
                                                name="input_feedback"
                                                required
                                                bind:value={input_feedback_data}
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
                                            color="primary"
                                            disabled={false}
                                            outline={false}
                                            size="md">제출</Button>
                                </Container>
                            </Row>
                        </Form>
                    </RequestFeedback>
                {:else}
                    <Card style="margin-right: 20%; margin-bottom: 20px;">
                        <CardHeader>
                            <CardTitle>알 수 없는 채팅 형식</CardTitle>
                        </CardHeader>
                        <CardBody>
                            <CardText>관리자에게 문의 바랍니다.</CardText>
                        </CardBody>
                        <CardFooter
                        >{new Intl.DateTimeFormat('ko-KR', {
                            year: 'numeric',
                            month: 'numeric',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: 'numeric',
                            second: 'numeric'
                        }).format(message.timestamp)}</CardFooter>
                    </Card>
                {/if}
            {/if}
        {/each}
    </div>
    <Form
            {validated}
            action="javascript:void(0);"
            on:submit={(e) => sendMessage()}
            method="post"
            id="chatForm"
    >
        <Container fluid style="display: {inputChatDisplayValue};">
            <Row>
                <Col>
                    <FormGroup floating label="여기에 어려움을 겪고 있는 내용을 입력하세요." class="form-outline mb-4">
                        <Input
                                type="text"
                                name="input_chat"
                                id="input_chat"
                                required
                                bind:value={input_chat_data}
                        />
                    </FormGroup>
                </Col>
                <Col xxs="2" sm="2">
                    <Button
                            class=""
                            block={true}
                            color="primary"
                            size="lg"
                    >전송</Button>
                </Col>
            </Row>
            {#if $messagePending}
                <div style="text-align: center; color: red;">
                    응답 생성 중입니다. 잠시만 기다려 주세요!
                </div>
            {/if}
        </Container>
    </Form>
</div>

<style>
    .chat-list {
        height: 100%;
        overflow-y: scroll;
        margin-top: 20px;
        padding-bottom: 200px;
        padding-left: 10px;
        padding-right: 10px;
    }

    :global(.action-button) {
        margin-right: 10px;
    }
</style>

<!-- TODO 테스트 데이터
let mentor_detail = {
    mentor_name: "테스트 멘토 이름",
    mentor_field: 2,
    mentor_sticc: {
        situation: "situation",
        task: "task",
        intent: "intent",
        concern: "concern",
        calibrate: "calibrate"
    }
};
let chat_history = [
    {
        seq: 0,
        chat_type: 2,
        chat_data: "멘토 정보 출력",
        candidates: [],
        timestamp: new Date().getTime(),
        visibility: true,
    },
    {
        seq: 1,
        chat_type: 3,
        chat_data: "이전 대화 요약",
        candidates: [],
        timestamp: new Date().getTime(),
        visibility: true,
    },
    {
        seq: 2,
        chat_type: 1,
        chat_data: "멘토 발화 테스트 1",
        candidates: [],
        timestamp: new Date().getTime(),
        visibility: true,
    },
    {
        seq: 3,
        chat_type: 0,
        chat_data: "유저 발화 테스트 1",
        candidates: [],
        timestamp: new Date().getTime(),
        visibility: true,
    },
    {
        seq: 4,
        chat_type: 4,
        chat_data: "Action 수락 요청",
        candidates: ["Action 1", "Action 2", "Action 3"],
        timestamp: new Date().getTime(),
        visibility: true,
    },
    {
        seq: 5,
        chat_type: 5,
        chat_data: "Action 결과 제출 요청",
        candidates: ["Action 1"], // 무조건 0번 index 사용
        timestamp: new Date().getTime(),
        visibility: true,
    },
    {
        seq: 6,
        chat_type: 1,
        chat_data: "멘토 발화 테스트 2",
        candidates: [],
        timestamp: new Date().getTime(),
        visibility: true,
    },
    {
        seq: 7,
        chat_type: 6,
        chat_data: "Acion 기능에 대해 여러분의 피드백을 요청합니다.",
        candidates: [],
        timestamp: new Date().getTime(),
        visibility: true,
    },
    {
        seq: 8,
        chat_type: 7,
        chat_data: "QnA 기능에 대해 여러분의 피드백을 요청합니다.",
        candidates: [],
        timestamp: new Date().getTime(),
        visibility: true,
    },
    {
        seq: 9,
        chat_type: 8,
        chat_data: "학습 방향 기능에 대해 여러분의 피드백을 요청합니다.",
        candidates: [],
        timestamp: new Date().getTime(),
        visibility: true,
    },
];
!-->
