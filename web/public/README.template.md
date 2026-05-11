# Your Terminal CV — VPS deployment guide

Hello **{{NAME}}** — this ZIP is everything you need to serve your CV over SSH from a Linux VPS.

## What's in this ZIP

| File | What it is |
|---|---|
| `{{BINARY_NAME}}` | The TUI binary for {{PLATFORM_LABEL}}. Reads `cv.json` from the working directory at startup. |
| `cv.json` | Your CV data — edit any time and the next run picks it up. |
| `README.md` | This file. |

## Just want to test it on this machine first?

Skip the ZIP entirely — back on the website, scroll to **Test it locally** and copy the one-line install command. It's the friction-free path: no Gatekeeper / SmartScreen prompts, no unzipping, no `chmod`. The instructions below are for **shipping your CV to a public VPS**.

## 1. Run it locally from this ZIP (optional)

{{LOCAL_RUN_BLOCK}}

Use `q` to quit. `a` = About · `p` = Projects · `s` = Skills (with filter) · `c` = Contact.

## 2. Deploy to a VPS (Linux only)

If you generated a non-Linux build above, that binary is for local testing only — Apple Silicon / Intel Mac / Windows binaries will not run on a Linux server. Regenerate the ZIP with **Linux x86_64** (or **Linux ARM64**) selected before following this section.

The pattern: configure `sshd` so anyone connecting as a `guest` user is forced into your TUI instead of getting a shell. The connection has no shell access — they just see the CV and disconnect when done.

### 2.1. Pick a VPS

Any Linux VPS works — match the architecture you downloaded. Cheap options: Hetzner Cloud (CX22 for x86, CAX11 for ARM, ~€4/mo), Vultr, DigitalOcean. SSH in as `root` to set up.

### 2.2. Create the guest user

```sh
adduser --disabled-password --gecos "" guest
```

(Empty password is fine — we'll disable password auth for guest anyway.)

### 2.3. Copy your files in

From **your local machine** (not the VPS):

```sh
scp -P 22 ssh-cv cv.json root@YOUR_VPS_IP:/opt/cv/
```

(You may need to `ssh root@YOUR_VPS_IP "mkdir -p /opt/cv"` first.)

Then on the VPS:

```sh
chmod 755 /opt/cv/ssh-cv
chmod 644 /opt/cv/cv.json
chown -R guest:guest /opt/cv
```

### 2.4. Configure sshd

Edit `/etc/ssh/sshd_config` and append the following block (or put it in a file under `/etc/ssh/sshd_config.d/`):

```
# Public terminal CV
Match User guest
    ForceCommand sh -c "cd /opt/cv && ./ssh-cv"
    PermitTTY yes
    PasswordAuthentication yes
    PermitEmptyPasswords yes
    AuthenticationMethods none
    AllowTcpForwarding no
    AllowAgentForwarding no
    X11Forwarding no
    PermitTunnel no
```

What this does:

- `ForceCommand` — every SSH session as `guest` runs your TUI binary and nothing else. They cannot drop to a shell.
- `PermitTTY yes` — the TUI needs a TTY to render.
- `PasswordAuthentication yes` + `PermitEmptyPasswords yes` + `AuthenticationMethods none` — anyone can connect without credentials.
- The `AllowTcpForwarding` / `AllowAgentForwarding` / `X11Forwarding` / `PermitTunnel` lines slam shut every tunneling pathway, so the connection really is read-only.

Apply the config:

```sh
sshd -t                   # syntax check
systemctl reload ssh      # (or sshd, depending on distro)
```

### 2.5. Test it

From **another machine**:

```sh
ssh guest@YOUR_VPS_IP
```

You should land in your TUI. Press `q` to quit, `a` for About, `p` for Projects, `s` for Skills (with filter), `c` for Contact.

## 3. Updating

To change your CV later, generate a new `cv.json` from the website and scp **only the JSON** to the VPS:

```sh
scp -P 22 cv.json root@YOUR_VPS_IP:/opt/cv/cv.json
```

No binary change, no sshd reload, no service restart — the next `ssh guest@...` reads the new file.

## 4. Sharing

Tell people: `ssh guest@YOUR_VPS_IP`. Put it on your business card, LinkedIn, email signature. Reach me at `{{EMAIL}}` if you have questions about the original generator.

## Security note

This config opens a passwordless SSH login to a single user (`guest`) whose only capability is running this one binary. As long as the binary itself doesn't shell out or have an exploit, the blast radius is limited to that user's home directory. You're trusting the `sshd_config` to keep them out of your real shell — keep the `ForceCommand` / forwarding lines exactly as above.
