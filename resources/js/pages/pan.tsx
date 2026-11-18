import { Form, Head } from '@inertiajs/react';
import { BadgeCheck } from 'lucide-react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { edit } from '@/routes/pan';

type Props = {
    pan: string | null;
    panName: string | null;
};

export default function Pan({ pan, panName }: Props) {
    return (
        <>
            <Head title="PAN details" />

            <div className="max-w-xl space-y-6 p-4">
                <Heading
                    title="PAN details"
                    description="Enter your PAN to complete your profile."
                />

                {pan !== null && (
                    <div className="flex items-start gap-3 rounded-lg border bg-muted/40 p-4">
                        <BadgeCheck
                            className="mt-0.5 size-5 text-green-600 dark:text-green-400"
                            aria-hidden="true"
                        />
                        <div>
                            <p className="font-medium">PAN saved</p>
                            <p className="text-sm text-muted-foreground">
                                <span className="font-mono">{pan}</span>
                                {panName !== null && <> · {panName}</>}
                            </p>
                        </div>
                    </div>
                )}

                <Form
                    action="/pan"
                    method="post"
                    options={{ preserveScroll: true }}
                    resetOnSuccess
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="pan">PAN</Label>
                                <Input
                                    id="pan"
                                    name="pan"
                                    defaultValue={pan ?? ''}
                                    placeholder="ABCDE1234F"
                                    autoComplete="off"
                                    maxLength={10}
                                    className="font-mono uppercase"
                                    aria-invalid={errors.pan !== undefined}
                                    aria-describedby="pan-help pan-error"
                                    required
                                />
                                <p
                                    id="pan-help"
                                    className="text-sm text-muted-foreground"
                                >
                                    5 letters, 4 digits, then 1 letter.
                                </p>
                                <div id="pan-error">
                                    <InputError message={errors.pan} />
                                </div>
                            </div>

                            <Button disabled={processing}>
                                {processing && <Spinner />}
                                {pan === null ? 'Verify PAN' : 'Update PAN'}
                            </Button>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

Pan.layout = {
    breadcrumbs: [
        {
            title: 'PAN details',
            href: edit(),
        },
    ],
};
