using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MidiMemeGame.Api.Data;
using MidiMemeGame.Api.Models;

namespace MidiMemeGame.Api.Controllers;

[ApiController]
[Route("api/photos")]
public class MemeTemplateController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _env;

    public MemeTemplateController(AppDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    [HttpGet]
    public async Task<IActionResult> GetMemeTemplates()
    {
        var memetemplate = await _context.MemeTemplates
            .Where(p => p.IsEnabled)
            .Select(p => new 
            {
                p.Id,
                p.FileName,
                p.FileSize,
                url = $"/api/photos/{p.Id}/file"
            })
            .ToListAsync();

        return Ok(memetemplate);
    }

    [HttpGet("{id:int}/file")]
    public async Task<IActionResult> GetMemeTemplateFile(int id)
    {
        var memetemplate = await _context.MemeTemplates.FindAsync(id);
        if (memetemplate == null)
        {
            return NotFound(new { message = "Photo not found" });
        }

        bool isAdmin = User.IsInRole("Admin");
        if (!memetemplate.IsEnabled && !isAdmin)
        {
            return Forbid();
        }

        var fullPath = Path.Combine(_env.ContentRootPath, memetemplate.RelativePath);

        if (!System.IO.File.Exists(fullPath))
        {
            return NotFound(new { message = "File not found on server" });
        }

        var contentType = memetemplate.ContentType ?? "image/jpeg";
        
  
        return PhysicalFile(fullPath, contentType, memetemplate.FileName);
    }
}