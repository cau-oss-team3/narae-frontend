<script>
    import {
        Card,
        CardBody,
        CardFooter,
        CardHeader,
        CardSubtitle,
        CardText,
        CardTitle,
        Container
    } from "@sveltestrap/sveltestrap";
    import SvelteMarkdown from "svelte-markdown";

    export let message;
</script>

<div class="card-chat">
    <Card>
        <CardHeader>
            <CardTitle>Action 수락 요청</CardTitle>
        </CardHeader>
        <CardBody>
            <CardText>
                <SvelteMarkdown source={message.chat_data} />
            </CardText>
            <Container class="d-flex justify-content-end">
                <slot></slot>
            </Container>
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
