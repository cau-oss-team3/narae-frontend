<script>
    import {
        Button,
        Card,
        CardBody,
        CardFooter,
        CardHeader,
        CardText,
        CardTitle, Col, Container, Form, FormGroup, Input, Row
    } from "@sveltestrap/sveltestrap";
    import SvelteMarkdown from "svelte-markdown";

    export let message;
    export let index;
    export let onSubmit;

    let validated = false;
    let input_temp_data = '';

    const submit = (resultCode)  => {
        onSubmit(index, resultCode, message.candidates[0], input_temp_data);
    }
</script>

<div class="card-chat">
    <Card>
        <CardHeader>
            <CardTitle>Action 결과 제출</CardTitle>
        </CardHeader>
        <CardBody>
            <CardText>
                <SvelteMarkdown source={message.chat_data} />
            </CardText>
            <Form {validated} action="javascript:void(0);"
                  on:submit={(e) =>
									submit(e.submitter.value)}
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
        <CardFooter>{new Intl.DateTimeFormat('ko-KR', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric'
        }).format(message.timestamp)}</CardFooter>
    </Card>
</div>

<style>
    .card-chat {
        margin-right: 20%;
        margin-bottom: 20px;
    }
</style>
