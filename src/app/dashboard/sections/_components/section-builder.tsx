import { Button, Drawer, useOverlayState } from '@heroui/react';
import { Ref, useImperativeHandle } from 'react';

interface IProps {
  ref: Ref<unknown>;
  className?: string;
}

export default function SectionBuilder(props: IProps) {
  const { ref, className } = props;
  const overlayState = useOverlayState();
  useImperativeHandle(ref, () => {
    return {
      open: () => {},
    };
  }, []);

  return (
    <>
      <Button onClick={overlayState.open} className={className}>
        创建
      </Button>
      <Drawer.Backdrop
        isOpen={overlayState.isOpen}
        onOpenChange={overlayState.setOpen}
      >
        <Drawer.Content>
          <Drawer.Content placement="right">
            <Drawer.Dialog>
              <Drawer.CloseTrigger />
              <Drawer.Header>
                <Drawer.Heading>Controlled with useState()</Drawer.Heading>
              </Drawer.Header>
              <Drawer.Body>
                <p>
                  This drawer is controlled by React&apos;s{' '}
                  <code>useState</code> hook. Pass <code>isOpen</code> and{' '}
                  <code>onOpenChange</code> props to manage the drawer state
                  externally.
                </p>
              </Drawer.Body>
              <Drawer.Footer>
                <Button slot="close" variant="secondary">
                  取消
                </Button>
              </Drawer.Footer>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Content>
      </Drawer.Backdrop>
    </>
  );
}
