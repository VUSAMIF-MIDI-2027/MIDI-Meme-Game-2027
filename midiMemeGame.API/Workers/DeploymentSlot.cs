namespace MidiMemeGame.Api.Workers;

internal static class DeploymentSlot
{
    internal static bool IsActive()
    {
        var slot = Environment.GetEnvironmentVariable("Deployment__Slot");
        if (string.IsNullOrEmpty(slot))
            return true;

        using var routing = File.OpenText("/run/midi-routing/active");
        return routing.ReadLine() == slot;
    }
}
