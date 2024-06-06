<script>
    import {
        Button,
        Card,
        CardBody,
        CardFooter,
        CardHeader,
        CardText,
        CardTitle,
        Col, Container,
        Form, FormGroup, Input,
        Row
    } from "@sveltestrap/sveltestrap";
    import SvelteMarkdown from "svelte-markdown";

    export let index;
    export let message;
    export let feedbackTitle;
    export let onSubmit;

    let validated = false;
    let input_feedback_data = '';

    const submit = (content)  => {
        onSubmit(index, message.chat_type - 6, content); // message.chat_type - 6 == feedback type
    }
</script>

<div class="card-chat">
    <Card>
        <CardHeader>
            <CardTitle>{feedbackTitle}</CardTitle>
        </CardHeader>
        <CardBody>
            <CardText>
                <SvelteMarkdown source={message.chat_data} />
            </CardText>
            <Form {validated} action="javascript:void(0);"
                  on:submit={(e) =>
									submit(input_feedback_data)}
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
        margin-left: 20%;
        margin-bottom: 20px;
    }
</style>
