<script>
    import {afterUpdate, onDestroy, onMount} from 'svelte';
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
        Row,
        Toast,
        ToastBody,
        ToastHeader
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

    let title = '대화하기';

    // WS 관련 변수
    let id = '';
    let ws = null;
    let userDataValue;
    let tokenReady = false;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;

    // Chat UI 관련 변수
    let validated = false;
    let element;
    let mentor_detail = null;
    let chat_history = [];

    // Chat Data 관련 변수
    let input_chat_data = '';
    let messagePending = writable(false);
    let showSendLimitToast = writable(false);
    let showResponseToast = writable(false);
    let toastLimitExceedMessage = writable('');
    let responseToastMessage = writable('It may take some time for the mentor to respond.');
    let messageCount = 0;
    let messageTimer = null;

    const scrollToBottom = (node) => {
        if (node) {
            node.scrollTop = node.scrollHeight;
        }
    };

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
        unsubscribeUserData();
        if (ws) {
            ws.close(); // Close WebSocket when component is destroyed
        }
        if (messageTimer) {
            clearInterval(messageTimer);
        }
    });


    afterUpdate(() => {
        scrollToBottom(element);
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

    $: if (chat_history && chat_history.length > 0) {
        if (element)
            scrollToBottom(element);
    }

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
        scrollToBottom(element);
    }


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
        // console.log("Mentor Detail:", json);

        if (json.isSuccess) {
            mentor_detail = json.mentor_detail;
            chat_history = json.chat_history;

            title = '대화하기 > ' + mentor_detail.mentor_name;
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
            input_chat_data = '';

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
            input_chat_data = '';

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
            input_chat_data = '';

            addMessage(json.chat_data);
        } else {
            alertData.set({code: res.status, err: json.err});
        }
    }

    async function sendMessage() {
        if (messageCount >= 3) {
            toastLimitExceedMessage.set('현재 메시지 전송은 1분에 3회까지 가능합니다.');
            showSendLimitToast.set(true);
            setTimeout(() => {
                showSendLimitToast.set(false);
            }, 3000);
            return;
        }

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
            messagePending.set(true);
            input_chat_data = '';
            scrollToBottom(element);

            messageCount++;
            if (messageCount === 1) {
                messageTimer = setTimeout(() => {
                    messageCount = 0;
                }, 60000);
            }

            responseToastMessage.set('멘토가 답장하는 데 시간이 걸릴 수 있습니다.');
            showResponseToast.set(true);
            setTimeout(() => {
                showResponseToast.set(false);
            }, 3000);
        } else {
            console.error('WebSocket is not open.');
        }
    }

    // 이전 대화기록 보기
    const goToChatHistory = (id) => {
        if (id != null) {
            goto(base + '/chat/history?id=' + id);
        }
    };
</script>

<svelte:head>
    <title>{title}</title>
</svelte:head>

<div class="container-fluid chat-container">
    <style>
        .chat-container {
            height: calc(100vh - 56px);
            display: flex;
            flex-direction: column;
        }

        .chat-list {
            flex: 1;
            overflow-y: auto;
            margin-top: 20px;
            padding-left: 10px;
            padding-right: 10px;
        }

        .button-container {
            display: flex;
            justify-content: center;
            width: 100%;
            margin-bottom: 20px;
        }

        .form-container {
            background-color: white;
            padding: 15px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            border-radius: 10px;
            margin-bottom: 0;
        }

        .align-items-center {
            align-items: center;
        }

        .modern-input {
            height: 3.5rem;
            padding: 0.75rem 1rem;
            font-size: 1.25rem;
            line-height: 1.5;
            border-radius: 10px;
            border: 1px solid #ced4da;
            transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }

        .modern-input:focus {
            border-color: #80bdff;
            box-shadow: 0 0 5px rgba(0, 123, 255, 0.25);
        }

        .send-button {
            height: 3.5rem;
            font-size: 1.25rem;
            line-height: 1.5;
            border-radius: 10px;
            transition: background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }

        .send-button:hover {
            background-color: #0056b3;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .pr-2 {
            padding-right: 0.5rem;
        }
    </style>

    <div bind:this={element} class="chat-list">
        <div class="button-container">
            <Button
                    class="btn-custom action-buttons"
                    color="success"
                    on:click={() => goToChatHistory(id)}
                    style="justify-content: center; margin-bottom: 20px;">
                이전 대화기록 보기
            </Button>
        </div>
        {#each chat_history as message, index}
            {#if message.visibility}
                {#if message.chat_type == 0} <!-- 사용자 발화 -->
                    <UserChat message={message}/>
                {:else if message.chat_type == 1} <!-- 멘토 발화 -->
                    <MentorChat message={message} mentor_detail={mentor_detail}/>
                {:else if message.chat_type == 2} <!-- 멘토 정보 출력 -->
                    <MentorInfo mentor_detail={mentor_detail}/>
                {:else if message.chat_type == 3} <!-- 이전 대화 요약 -->
                    <PreviousChat message={message}/>
                {:else if message.chat_type == 4} <!-- Action 수락요청 -->
                    <ActionRequestAccept message={message} index={index} onSubmit={acceptAction}/>
                {:else if message.chat_type == 5} <!-- Action 결과 제출 요청 -->
                    <ActionRequestResultReport message={message} index={index} onSubmit={postActionResult}/>
                {:else if message.chat_type == 6} <!-- Action Feedback 요청 -->
                    <RequestFeedback message={message} feedbackTitle="Action Feedback 요청" index={index}
                                     onSubmit={postFeedback}/>
                {:else if message.chat_type == 7} <!-- QnA Feedback 요청 -->
                    <RequestFeedback message={message} feedbackTitle="QnA Feedback 요청" index={index}
                                     onSubmit={postFeedback}/>
                {:else if message.chat_type == 8} <!-- 학습 방향 Feedback 요청 -->
                    <RequestFeedback message={message} feedbackTitle="학습 방향 Feedback 요청" index={index}
                                     onSubmit={postFeedback}/>
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
            action="javascript:void(0);"
            id="chatForm"
            method="post"
            on:submit={() => sendMessage()}
            class="form-container"
            {validated}
    >
        <Container fluid style="padding: 0;">
            <Row noGutters class="align-items-center">
                <Col sm="10" xs="10" class="pr-2">
                    <FormGroup class="form-outline mb-0" floating label="여기에 어려움을 겪고 있는 내용을 입력하세요.">
                        <Input
                                bind:value={input_chat_data}
                                id="input_chat"
                                name="input_chat"
                                required
                                type="text"
                                class="form-control-lg modern-input"
                        />
                    </FormGroup>
                </Col>
                <Col sm="2" xs="2">
                    <Button
                            block={true}
                            color="primary"
                            size="lg"
                            class="send-button modern-button"
                            style="margin-bottom: 16px;"
                    >전송
                    </Button>
                </Col>
            </Row>
        </Container>
    </Form>

    {#if $showSendLimitToast}
        <Toast isOpen={$showSendLimitToast}
               style="position: fixed; bottom: 50%; left: 50%; transform: translate(-50%, 50%); width: 300px; z-index: 1050; font-size: 1.2em;">
            <ToastHeader toggle={() => showSendLimitToast.set(false)}>
                알림
            </ToastHeader>
            <ToastBody style="text-align: center;">
                {$toastLimitExceedMessage}
            </ToastBody>
        </Toast>
    {/if}

    {#if $showResponseToast}
        <Toast isOpen={$showResponseToast}
               style="position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); width: 300px; z-index: 1050; background-color: #343a40; color: #fff; border-radius: 8px; padding: 10px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);">
            <ToastHeader style="background-color: #343a40; color: #fff; border-bottom: none;">
                알림
            </ToastHeader>
            <ToastBody style="text-align: center;">
                {$responseToastMessage}
            </ToastBody>
        </Toast>
    {/if}
</div>

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
