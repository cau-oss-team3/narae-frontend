<script>
    import {Card, CardBody, CardHeader, CardSubtitle, CardText, CardTitle} from "@sveltestrap/sveltestrap";

    export let mentor_detail;

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
</script>

<div class="card-chat">
    <Card>
        <CardHeader class="card-chat-header">
            <CardTitle class="card-chat-title">멘토
                정보
            </CardTitle>
        </CardHeader>
        <CardBody class="card-chat-body">
            <CardText class="card-chat-body-text">
                개발에서 어려움이 있다면 말해주세요. <br/>
                답변 생성이 20초 정도 걸릴 수 있으니 기다려주세요!
            </CardText>

            <div class="card-chat-body-div">
                <CardSubtitle class="card-chat-body-div-subtitle">멘토
                    이름: {mentor_detail.mentor_name}</CardSubtitle>
                <br/>
                <CardText class="card-chat-body-div-text">
                    멘토의 분야: {fieldCodeToString(mentor_detail.mentor_field)}
                    <br/>
                    <br/>
                    <div class="card-chat-body-div-text-info">현재 멘토링 중인 정보
                    </div>
                    <div class="card-chat-body-div-text-sticc">
                        상황:<br/>
                        {mentor_detail.mentor_sticc.situation}
                        <br/><br/>
                        작업: <br/>
                        {mentor_detail.mentor_sticc.task}
                        <br/><br/>
                        의도: <br/>
                        {mentor_detail.mentor_sticc.intent}
                        <br/><br/>
                        고민: <br/>
                        {mentor_detail.mentor_sticc.concern}
                        <br/><br/>
                        추가 정보: <br/>
                        {mentor_detail.mentor_sticc.calibrate}
                        <br/>
                    </div>
                </CardText>
            </div>
        </CardBody>
    </Card>
</div>

<style>
    .card-chat {
        margin-bottom: 20px;
        margin-left: 10%;
        margin-right: 10%;
        border: 1px solid #ccc;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    :global(.card-chat-header) {
        background-color: #f7f7f7;
        border-bottom: 1px solid #eee;
        padding: 16px;
    }

    :global(.card-chat-title) {
        text-align: center;
        font-size: 24px;
        color: #333;
        font-weight: bold;
    }

    :global(.card-chat-body) {
        text-align: center;
        padding: 20px;
    }

    :global(.card-chat-body-text) {
        text-align: center;
        font-size: 18px;
        font-weight: bold;
        color: #555;
        margin-bottom: 20px;
    }

    .card-chat-body-div {
        text-align: left;
        margin-top: 20px;
    }

    :global(.card-chat-body-div-subtitle) {
        font-size: 20px;
        font-weight: bold;
        color: #444;
    }

    :global(.card-chat-body-div-text) {
        font-size: 16px;
        color: #666;
    }

    .card-chat-body-div-text-info {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 10px;
    }

    .card-chat-body-div-text-sticc {
        font-size: 16px;
    }
</style>
