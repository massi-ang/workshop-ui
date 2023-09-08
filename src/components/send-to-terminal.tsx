import Button from "@cloudscape-design/components/button";

interface IProps {
    send: (m: string)=>void;
    code: string;
    children: string;
}

export default function SendToTerminal(props: IProps) {
    const { send, code, children } = props;
    return (
        <Button onClick={()=>send(code)}> {children} </Button>
    )
}