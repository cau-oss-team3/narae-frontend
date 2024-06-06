<script>
    import {Card, CardBody, CardFooter, CardHeader, CardText, CardTitle} from "@sveltestrap/sveltestrap";
    import SvelteMarkdown from "svelte-markdown";

    export let message;
</script>

<div class="card-chat">
    <Card>
        <CardHeader>나
            <CardTitle>나</CardTitle>
        </CardHeader>
        <CardBody>
            <CardText>
                <SvelteMarkdown source={message.chat_data} />
            </CardText>
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
        text-align: end;
    }
</style>
