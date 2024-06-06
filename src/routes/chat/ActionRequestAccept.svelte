<script>
    import {
        Button,
        Card,
        CardBody,
        CardFooter,
        CardHeader,
        CardText,
        CardTitle,
        Container
    } from "@sveltestrap/sveltestrap";
    import SvelteMarkdown from "svelte-markdown";

    export let message;
    export let index;
    export let onSubmit;

    const submit = (isAccept, candidate)  => {
        onSubmit(index, isAccept, candidate);
    }

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
                {#each message.candidates as candidate}
                    <Button
                            class="action-button"
                            active={false}
                            block={false}
                            close={false}
                            color="secondary"
                            disabled={false}
                            outline={false}
                            size="md"
                            on:click={() => submit(true, candidate)}
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
                        on:click={() => submit(false, null)}
                        value="">거절하기</Button>
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
