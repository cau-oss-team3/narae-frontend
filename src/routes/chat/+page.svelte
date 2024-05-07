<!-- TODO 개발 -->
<script>
    import {onDestroy, onMount} from 'svelte';
    import {page} from '$app/stores';
    import {PUBLIC_API_SERVER, PUBLIC_WS_SERVER} from '$env/static/public';
    import {alertData, userData} from '../../stores.js';
    import {goto} from '$app/navigation';
    import {base} from '$app/paths';
    import {
        Button,
        Card,
        CardBody,
        CardFooter,
        CardHeader,
        CardSubtitle,
        CardText,
        CardTitle,
        Col,
        Container,
        Form,
        FormGroup,
        Input,
        Row
    } from '@sveltestrap/sveltestrap';

    let id = '';
    let ws = null;
    let userDataValue;
    let tokenReady = false;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;

    const unsubscribeUserData = userData.subscribe((value) => {
        userDataValue = value;
        if (userDataValue && userDataValue.token) {
            tokenReady = true;
            if (id) {  // Ensure id is also ready
                connectWebSocket();  // Connect when both id and token are ready
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
        };

        ws.onerror = function (error) {
            console.error("WebSocket error:", error);
        };

        ws.onclose = () => {
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

    /* 더미 데이터 TODO 삭제

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
            type: 2,
            chat_data: "멘토 정보 출력",
            candidates: [],
            timestamp: new Date().getTime(),
            visibility: true,
        },
        {
            seq: 1,
            type: 3,
            chat_data: "이전 대화 요약",
            candidates: [],
            timestamp: new Date().getTime(),
            visibility: true,
        },
        {
            seq: 2,
            type: 1,
            chat_data: "멘토 발화 테스트 1",
            candidates: [],
            timestamp: new Date().getTime(),
            visibility: true,
        },
        {
            seq: 3,
            type: 0,
            chat_data: "유저 발화 테스트 1",
            candidates: [],
            timestamp: new Date().getTime(),
            visibility: true,
        },
        {
            seq: 4,
            type: 4,
            chat_data: "Action 수락 요청",
            candidates: ["Action 1", "Action 2", "Action 3"],
            timestamp: new Date().getTime(),
            visibility: true,
        },
        {
            seq: 5,
            type: 5,
            chat_data: "Action 결과 제출 요청",
            candidates: ["Action 1"], // 무조건 0번 index 사용
            timestamp: new Date().getTime(),
            visibility: true,
        },
        {
            seq: 6,
            type: 1,
            chat_data: "멘토 발화 테스트 2",
            candidates: [],
            timestamp: new Date().getTime(),
            visibility: true,
        },
    ];

     */

    let mentor_detail = null;
    let chat_history = [];

    let input_chat_data = '';
    let input_temp_data = '';

    // Function to add a new message to the chat
    /**
     * @param {{
     *    "seq": "int",
     *    "type": "Chat Type Code <int>",
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

    const fieldCodeToString = (code) => {
        if (code == 0) {
            return '백엔드';
        } else if (code == 1) {
            return '프론트';
        } else if (code == 2) {
            return '백엔드, 프론트';
        } else {
            return '알수없음';
        }
    };

    // 맨토 정보 불러오기
    async function getMentor() {
        if (!userDataValue?.token) {
            console.log('Token is not available.')
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


    // 메시지 전송 TODO 구현
    async function sendMessage() {
        const messageData = {
            // 채팅창에 입력한 데이터임 이거 사용하면됨
            chat_type: 0,
            chat_data: input_chat_data
        };

        //TODO Websocket 구현
		if (ws.readyState === WebSocket.OPEN) {
			ws.send(JSON.stringify(messageData));
			input_chat_data = ''; // Clear input after sending
		} else {
			console.error('WebSocket is not open.');
		}

        // 웹소켓 전송했을때 에러가 없는경우
        let isErr = false;

        if (!isErr) {
            //에러가 없는 경우
            addMessage({
                seq: -1,
                chat_type: 0,
                chat_data: messageData.chat_data,
                candidates: [],
                timestamp: new Date().getTime(),
                visibility: true
            });
        } else {
            //TODO 에러 처리 alertData.set({code:res.status, err:json.err});
        }
    }
</script>

<div id="chat_container" class="container-fluid" style="height: 75vh;">
    <div
            bind:this={element}
            style="height: 100%; overflow-y: scroll; margin-top: 20px; padding-bottom: 200px; padding-left: 10px; padding-right: 10px;"
    >
        {#each chat_history as message, index}
            {#if message.visibility}
                {#if message.chat_type == 0}
                    <Card style="margin-left: 20%; margin-bottom: 20px; text-align: end;">
                        <CardHeader>나
                            <CardTitle>나</CardTitle>
                        </CardHeader>
                        <CardBody>
                            <CardText>
                                {message.chat_data}
                            </CardText>
                        </CardBody>
                        <CardFooter
                        >{new Intl.DateTimeFormat('ko-KR', {
                            year: 'numeric',
                            month: 'numeric',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: 'numeric',
                            second: 'numeric'
                        }).format(message.timestamp)}</CardFooter
                        >
                    </Card>
                {:else if message.chat_type == 1}
                    <Card style="margin-right: 20%; margin-bottom: 20px;">
                        <CardHeader>
                            <CardTitle>{mentor_detail.mentor_name}</CardTitle>
                        </CardHeader>
                        <CardBody>
                            <CardText>
                                {message.chat_data}
                            </CardText>
                        </CardBody>
                        <CardFooter
                        >{new Intl.DateTimeFormat('ko-KR', {
                            year: 'numeric',
                            month: 'numeric',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: 'numeric',
                            second: 'numeric'
                        }).format(message.timestamp)}</CardFooter
                        >
                    </Card>
                {:else if message.chat_type == 2}
                    <Card style="margin-bottom: 20px; margin-left: 10%; margin-right: 10%;">
                        <CardHeader>
                            <CardTitle style="text-align: center;">멘토 정보</CardTitle>
                        </CardHeader>
                        <CardBody style="text-align: center;">
                            <CardSubtitle>멘토 이름: {mentor_detail.mentor_name}</CardSubtitle>
                            <br/>
                            <CardText>
                                분야: {fieldCodeToString(mentor_detail.mentor_field)}
                                <br/>
                                <br/>
                                <h5>STICC</h5>
                                Situation:<br/>
                                {mentor_detail.mentor_sticc.situation}
                                <br/><br/>
                                Task: <br/>
                                {mentor_detail.mentor_sticc.task}
                                <br/><br/>
                                Intent: <br/>
                                {mentor_detail.mentor_sticc.intent}
                                <br/><br/>
                                Concern: <br/>
                                {mentor_detail.mentor_sticc.concern}
                                <br/><br/>
                                Calibrate: <br/>
                                {mentor_detail.mentor_sticc.calibrate}
                                <br/>
                            </CardText>
                        </CardBody>
                    </Card>
                {:else if message.chat_type == 3}
                    <Card style="margin-bottom: 20px; margin-left: 10%; margin-right: 10%;">
                        <CardHeader>
                            <CardTitle style="text-align: center;">이전 대화 요약</CardTitle>
                        </CardHeader>
                        <CardBody>
                            <CardSubtitle style="text-align: center;"><b>대화 요약</b></CardSubtitle>
                            <br/>
                            <CardText>
                                {message.chat_data}
                            </CardText>
                        </CardBody>
                    </Card>
                {:else if message.chat_type == 4}
                    <Card style="margin-right: 20%; margin-bottom: 20px;">
                        <CardHeader>
                            <CardTitle>Action 수락 요청</CardTitle>
                        </CardHeader>
                        <CardBody>
                            <CardSubtitle>Card subtitle</CardSubtitle>
                            <CardText>
                                {message.chat_data}
                            </CardText>
                            <Container class="d-flex justify-content-end">
                                {#each message.candidates as candidate, index}
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
                                            style="margin-right: 10px;"
                                            on:click={() => acceptAction(index, true, candidate)}
                                            value="">{candidate}</Button
                                    >
                                {/each}
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
                                        on:click={() => acceptAction(index, false, null)}
                                        value="">거절하기
                                </Button
                                >
                            </Container>
                        </CardBody>
                        <CardFooter
                        >{new Intl.DateTimeFormat('ko-KR', {
                            year: 'numeric',
                            month: 'numeric',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: 'numeric',
                            second: 'numeric'
                        }).format(message.timestamp)}</CardFooter
                        >
                    </Card>
                {:else if message.chat_type == 5}
                    <Card style="margin-right: 20%; margin-bottom: 20px;">
                        <CardHeader>
                            <CardTitle>Action 결과 제출</CardTitle>
                        </CardHeader>
                        <CardBody>
                            <CardText>
                                {message.chat_data}
                            </CardText>
                            <Form
                                    {validated}
                                    action="javascript:void(0);"
                                    on:submit={(e) =>
									postActionResult(
										index,
										e.submitter.value,
										message.candidates[0],
										input_temp_data
									)}
                                    method="post"
                            >
                                <Row>
                                    <Col>
                                        <FormGroup
                                                floating
                                                label="왜 성공 / 실패 / 보류 했는지 짧게 작성해주세요."
                                                class="form-outline mb-4"
                                        >
                                            <Input
                                                    type="text"
                                                    name="input_chat"
                                                    id="input_chat"
                                                    required
                                                    bind:value={input_temp_data}
                                            />
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <Row>
                                    <Container class="d-flex justify-content-end">
                                        <Button
                                                class=""
                                                active={false}
                                                block={false}
                                                children=""
                                                close={false}
                                                color="warning"
                                                disabled={false}
                                                href=""
                                                outline={false}
                                                size="md"
                                                style="margin-right: 10px;"
                                                value="2">보류
                                        </Button
                                        >
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
                                                style="margin-right: 10px;"
                                                value="0">실패
                                        </Button
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
                                                style="margin-right: 10px;"
                                                value="1">완수
                                        </Button
                                        >
                                    </Container>
                                </Row>
                            </Form>
                        </CardBody>
                        <CardFooter
                        >{new Intl.DateTimeFormat('ko-KR', {
                            year: 'numeric',
                            month: 'numeric',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: 'numeric',
                            second: 'numeric'
                        }).format(message.timestamp)}</CardFooter
                        >
                    </Card>
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
                        }).format(message.timestamp)}</CardFooter
                        >
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
                    <FormGroup floating label="여기에 내용을 입력하세요." class="form-outline mb-4">
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
                            active={false}
                            block={true}
                            children="Button"
                            close={false}
                            color="primary"
                            disabled={false}
                            href=""
                            outline={false}
                            size="lg"
                            value="">전송
                    </Button
                    >
                </Col>
            </Row>
        </Container>
    </Form>
</div>
