<script>
    import {Card, CardBody, CardFooter, CardHeader, CardText, CardTitle} from "@sveltestrap/sveltestrap";
    import SvelteMarkdown from "svelte-markdown";

    export let message;
    export let mentor_detail;
</script>

<div class="card-chat">
    <Card>
        <CardHeader>
            <CardTitle>{mentor_detail.mentor_name}</CardTitle>
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
        margin-right: 20%;
        margin-bottom: 20px;
    }
</style>
