<script>
    import {Card, CardBody, CardHeader, CardSubtitle, CardText, CardTitle} from "@sveltestrap/sveltestrap";
    import SvelteMarkdown from "svelte-markdown";

    export let message;
</script>

<div class="card-chat">
    <Card>
        <CardHeader>
            <CardTitle class="card-chat-title">이전 대화 요약</CardTitle>
        </CardHeader>
        <CardBody>

            <CardSubtitle class="card-chat-title"><b>대화 요약</b></CardSubtitle>
            <br/>
            <CardText>
                <SvelteMarkdown source={message.chat_data} />
            </CardText>
        </CardBody>
    </Card>
</div>

<style>
    .card-chat {
        margin-bottom: 20px;
        margin-left: 10%;
        margin-right: 10%;
    }

    :global(.card-chat-title) {
        text-align: center;
    }
</style>
