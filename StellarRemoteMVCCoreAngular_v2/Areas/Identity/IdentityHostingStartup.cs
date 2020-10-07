using System;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using StellarRemoteMVCCoreAngular_v2.Data;

[assembly: HostingStartup(typeof(StellarRemoteMVCCoreAngular_v2.Areas.Identity.IdentityHostingStartup))]
namespace StellarRemoteMVCCoreAngular_v2.Areas.Identity
{
    public class IdentityHostingStartup : IHostingStartup
    {
        public void Configure(IWebHostBuilder builder)
        {
            builder.ConfigureServices((context, services) => {
            });
        }
    }
}